'use client'
import { SessionUser } from '@/lib/auth/auth'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { AvatarImage } from '@radix-ui/react-avatar'
import { getInitials } from '@/lib/format-tweet-data'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { ImageIcon, X } from 'lucide-react'
import { useState } from 'react'
import { createTweet } from '@/lib/actions/tweets'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'

interface TweetComposerProps {
    user?: SessionUser
    placeholder?: string
    onSubmit?: (content: string, imageUrl?: string) => void
    onCancel?: () => void
}

export default function TweetComposer({
    user,
    placeholder = "What's Happening?",
    onSubmit,
    onCancel,
}: TweetComposerProps) {
    const [content, setContent] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState<boolean>(false)

    const router = useRouter()

    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        // validate file is image
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image')
            return
        }

        console.log(file)

        setSelectedFile(file)
        const previewURL = URL.createObjectURL(file)
        console.log({ previewURL })
        setSelectedImage(previewURL)
    }

    function removeImage() {
        setSelectedFile(null)
        setSelectedImage(null)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!content.trim() || isLoading) return
        setIsLoading(true)

        try {
            let imageUrl: string | undefined
            if (selectedFile) {
                setIsUploading(true)
                const formData = new FormData()
                formData.append('file', selectedFile)
                formData.append('upload_preset', 'twitter-clone')

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                )
                if (!response.ok) {
                    toast.error('Failed to upload image')
                    return
                }

                const data = await response.json()
                imageUrl = data.secure_url
                setIsUploading(false)
            }
            if (onSubmit) {
                onSubmit(content.trim(), imageUrl) // reply
                setContent('')
                setSelectedFile(null)
                setSelectedImage(null)
            } else {
                const result = await createTweet(content.trim(), imageUrl)
                if (result.success) {
                    setContent('')
                    router.refresh()
                } else {
                    toast.error('Failed to create tweet')
                }
            }
        } catch (err) {
            toast.error('Failed to create tweet :' + err)
        } finally {
            setIsLoading(false)
            setSelectedFile(null)
            setSelectedImage(null)
        }
    }

    console.log({ selectedImage })

    return (
        <div className='border-b border-border p-4'>
            <form
                className='space-y-3'
                onSubmit={handleSubmit}
            >
                <div className='flex space-x-3'>
                    {user && (
                        <Avatar>
                            <AvatarImage src={user.avatar ?? undefined} />
                            <AvatarFallback>
                                {getInitials(user?.name ?? 'U')}
                            </AvatarFallback>
                        </Avatar>
                    )}
                    <div className='flex-1 space-y-3'>
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={placeholder}
                            maxLength={280}
                            className='min-h-25 border-0 resize-none text-lg placeholder:text-muted-foreground focus-visible:ring-0 shadow-md'
                        />

                        {selectedImage && (
                            <div className='relative'>
                                <Image
                                    src={selectedImage}
                                    alt='Selected'
                                    width={800}
                                    height={320}
                                    className='max-w-full max-h-80 rounded-lg object-cover'
                                />
                                <Button
                                    onClick={removeImage}
                                    type='button'
                                    className='absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 z-50'
                                >
                                    <X className='w-4 h-4' />
                                </Button>
                            </div>
                        )}

                        <div className='flex justify-between items-center'>
                            <div className='flex space-x-4'>
                                <input
                                    type='file'
                                    id='image-upload'
                                    className='hidden'
                                    accept='image/*'
                                    onChange={handleFileUpload}
                                />
                                <Button
                                    variant='ghost'
                                    type='button'
                                    className='text-blue-500 hover:text-blue-600 p-2'
                                    onClick={() =>
                                        document
                                            .getElementById('image-upload')
                                            ?.click()
                                    }
                                >
                                    <ImageIcon className='w-5 h-5' />
                                </Button>
                            </div>
                            <div className='flex items-center space-x-3'>
                                <span className='text-sm text-muted-foreground'>
                                    {content.length}/280
                                </span>

                                {/* Reply */}

                                {onCancel && (
                                    <Button
                                        type='button'
                                        variant='outline'
                                        className='rounded-full px-6'
                                        onClick={onCancel}
                                    >
                                        Cancel
                                    </Button>
                                )}

                                <Button
                                    type='submit'
                                    className='rounded-full px-6'
                                    disabled={
                                        !content.trim() || content.length > 280
                                    }
                                >
                                    {isLoading
                                        ? 'Posting... '
                                        : isUploading
                                        ? 'Uploading...'
                                        : 'Tweet'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
