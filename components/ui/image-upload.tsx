'use client'

import { useState, useId } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/components/ui/use-toast'

interface ImageUploadProps {
    value: string
    onChange: (url: string) => void
    disabled?: boolean
    bucketName?: string
    folderPath?: string
}

export function ImageUpload({
    value,
    onChange,
    disabled,
    bucketName = 'project-images',
    folderPath = 'uploads'
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const { toast } = useToast()
    const supabase = createClient()

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        try {
            const file = e.target.files?.[0]
            if (!file) return

            // Basic validation
            if (!file.type.startsWith('image/')) {
                toast({
                    title: 'Invalid file type',
                    description: 'Please upload an image file',
                    variant: 'destructive',
                })
                return
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({
                    title: 'File too large',
                    description: 'Image size should be less than 5MB',
                    variant: 'destructive',
                })
                return
            }

            setIsUploading(true)

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
            const filePath = `${folderPath}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath)

            onChange(publicUrl)

            toast({
                title: 'Success',
                description: 'Image uploaded successfully',
            })

        } catch (error: any) {
            console.error('Upload error:', error)
            toast({
                title: 'Error',
                description: error.message || 'Failed to upload image',
                variant: 'destructive',
            })
        } finally {
            setIsUploading(false)
            // Reset input value so same file can be selected again if needed
            e.target.value = ''
        }
    }

    function handleRemove() {
        onChange('')
    }

    const uniqueId = useId()
    const id = `image-upload-${uniqueId}`

    return (
        <div className="space-y-4 w-full">
            <div className="flex items-center gap-4">
                {value ? (
                    <div className="relative aspect-video w-40 rounded-lg overflow-hidden border bg-muted">
                        <Image
                            fill
                            src={value}
                            alt="Upload"
                            className="object-cover"
                        />
                        <Button
                            onClick={handleRemove}
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            disabled={disabled}
                            type="button"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-dashed bg-muted/50 text-muted-foreground">
                        <ImageIcon className="h-10 w-10 opacity-50" />
                    </div>
                )}

                <div className="flex-1 space-y-2">
                    <Label htmlFor={id} className="font-medium">
                        Upload Image
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            id={id}
                            type="file"
                            accept="image/*"
                            disabled={disabled || isUploading}
                            onChange={handleUpload}
                            className="file:bg-secondary file:text-secondary-foreground file:border-0 file:text-sm file:font-medium file:px-4 file:py-1 file:mr-4 file:rounded-full hover:file:bg-secondary/80 hidden"
                        />
                        <Label
                            htmlFor={id}
                            className={`flex h-10 px-4 py-2 w-full md:w-auto items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer ${isUploading || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Choose File
                                </>
                            )}
                        </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Recommended aspect ratio 16:9. Max size 5MB.
                    </p>
                </div>
            </div>
        </div>
    )
}
