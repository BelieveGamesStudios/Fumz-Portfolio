'use client'

import React, { useState, useRef, useId } from 'react'
import { Upload, Link2, X, FileArchive, FileText, CheckCircle2, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface FileUploadOrUrlProps {
  value: string
  onChange: (url: string) => void
  folder?: 'builds' | 'certifications' | 'projects' | 'uploads'
  accept?: string
  maxSizeMB?: number
  label?: string
  description?: string
  placeholder?: string
  disabled?: boolean
}

export function FileUploadOrUrl({
  value,
  onChange,
  folder = 'uploads',
  accept,
  maxSizeMB = 25,
  label,
  description,
  placeholder = 'https://...',
  disabled = false,
}: FileUploadOrUrlProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()

  const isImage = (url: string) => {
    return /\.(png|jpe?g|webp|gif|svg|bmp)(\?.*)?$/i.test(url)
  }

  const isArchive = (url: string) => {
    return /\.(zip|rar|7z|tar|gz|apk|exe|dmg|pkg)(\?.*)?$/i.test(url)
  }

  const isPdf = (url: string) => {
    return /\.pdf(\?.*)?$/i.test(url)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setErrorMessage(null)

    // Check size limit
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setErrorMessage(`File size exceeds maximum allowed limit (${maxSizeMB}MB)`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)
      setFileName(file.name)

      // 1. Get Presigned URL from backend
      const presignRes = await fetch('/api/r2/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size,
          folder,
        }),
      })

      if (!presignRes.ok) {
        const errorData = await presignRes.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to get upload authorization')
      }

      const { uploadUrl, publicUrl } = await presignRes.json()

      // 2. Direct upload to R2 with XMLHttpRequest (and fetch fallback)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', uploadUrl, true)
        if (file.type) {
          xhr.setRequestHeader('Content-Type', file.type)
        }

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(percentComplete)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`R2 upload failed with status ${xhr.status} (${xhr.statusText || 'Error'})`))
          }
        }

        xhr.onerror = async () => {
          console.warn('XHR failed, attempting fetch upload fallback...')
          try {
            const fetchRes = await fetch(uploadUrl, {
              method: 'PUT',
              headers: file.type ? { 'Content-Type': file.type } : {},
              body: file,
            })
            if (fetchRes.ok) {
              setUploadProgress(100)
              resolve()
            } else {
              const errBody = await fetchRes.text().catch(() => '')
              reject(new Error(`Upload failed (${fetchRes.status}): ${errBody || 'Network error'}`))
            }
          } catch (fetchErr: any) {
            reject(new Error(fetchErr.message || 'Network error during upload to R2'))
          }
        }

        xhr.send(file)
      })

      // 3. Set public URL in form
      onChange(publicUrl)
      setUploadProgress(100)
    } catch (err: any) {
      console.error('Upload failed:', err)
      setErrorMessage(err.message || 'Upload failed. Please check your network.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleClear = () => {
    onChange('')
    setFileName('')
    setErrorMessage(null)
    setUploadProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-2 w-full min-w-0">
      {/* Hidden file input always mounted so Change button works */}
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled || isUploading}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Top Header: Label & Mode Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-2 min-w-0">
        {label && <Label className="text-xs font-bold text-neutral-800">{label}</Label>}

        {/* Segmented Mode Control */}
        <div className="flex items-center p-0.5 bg-neutral-100 rounded-lg border border-neutral-200/80 shrink-0">
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              mode === 'upload'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => setMode('url')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              mode === 'url'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Paste Link</span>
          </button>
        </div>
      </div>

      {/* Upload Mode */}
      {mode === 'upload' && (
        <div className="space-y-2 w-full min-w-0">
          {/* If a file/URL is already selected and not currently uploading */}
          {value && !isUploading ? (
            <div className="relative p-2.5 sm:p-3 bg-neutral-50 border border-neutral-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 w-full min-w-0 overflow-hidden">
              <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                {isImage(value) ? (
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-neutral-200 overflow-hidden shrink-0 border border-neutral-300">
                    <img src={value} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : isArchive(value) ? (
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-red-50 text-[#E31B23] flex items-center justify-center shrink-0 border border-red-100">
                    <FileArchive className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                ) : isPdf(value) ? (
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-red-50 text-[#E31B23] flex items-center justify-center shrink-0 border border-red-100">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                ) : (
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0 border border-neutral-200">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                )}

                <div className="min-w-0 w-0 flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-neutral-900 truncate">
                    {fileName || value.split('/').pop() || 'Uploaded Resource'}
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate block w-full" title={value}>{value}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-7 sm:h-8 text-xs font-semibold px-2.5"
                >
                  Change
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleClear}
                  className="h-7 w-7 sm:h-8 sm:w-8 text-neutral-400 hover:text-red-600 hover:bg-red-50"
                  aria-label="Remove"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            /* Upload Drop Area */
            <div className="w-full min-w-0">
              <div
                onClick={() => !isUploading && !disabled && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-4 sm:p-5 text-center transition-all cursor-pointer w-full min-w-0 ${
                  isUploading
                    ? 'border-[#E31B23] bg-red-50/20 cursor-wait'
                    : 'border-neutral-200 hover:border-[#E31B23] hover:bg-neutral-50/70 bg-white'
                }`}
              >
                {isUploading ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-900">
                      <Loader2 className="w-4 h-4 animate-spin text-[#E31B23]" />
                      <span>Uploading to Cloudflare R2... {uploadProgress}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden max-w-xs mx-auto">
                      <div
                        className="bg-[#E31B23] h-2 rounded-full transition-all duration-200 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    {fileName && <p className="text-[11px] text-neutral-500 truncate">{fileName}</p>}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center mb-0.5">
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <p className="text-xs font-bold text-neutral-800">
                      Click to browse or drag file here
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Direct upload to Cloudflare R2 (Max {maxSizeMB >= 1000 ? `${(maxSizeMB / 1000).toFixed(0)}GB` : `${maxSizeMB}MB`})
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL Mode */}
      {mode === 'url' && (
        <div className="space-y-2 w-full min-w-0">
          <div className="relative w-full min-w-0">
            <Input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="text-xs pr-9 h-9 sm:h-10 w-full"
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick link preview if URL entered */}
          {value && (
            <div className="flex items-center justify-between text-[11px] text-neutral-500 bg-neutral-50 p-2 rounded-lg border border-neutral-100 min-w-0 overflow-hidden">
              <span className="truncate mr-2 flex-1">Target: {value}</span>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#E31B23] font-semibold hover:underline shrink-0"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {errorMessage && (
        <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
      )}

      {/* Description */}
      {description && !errorMessage && (
        <p className="text-[11px] text-neutral-400">{description}</p>
      )}
    </div>
  )
}
