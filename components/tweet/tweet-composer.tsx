'use client'
import { SessionUser } from '@/lib/auth/auth'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { AvatarImage } from '@radix-ui/react-avatar'
import { getInitials } from '@/lib/format-tweet-data'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { createTweet } from '@/lib/actions/tweets'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface TweetComposerProps {
    user?: SessionUser
    placeholder?: string
    onSubmit?: () => void
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
    const router = useRouter()
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!content.trim() || isLoading) return
        setIsLoading(true)

        try {
            const result = await createTweet(content.trim())
            if (result.success) {
                setContent('')
                router.refresh()
            } else {
                toast.error('Failed to create tweet')
            }
        } catch (err) {
            toast.error('Failed to create tweet :' + err)
        } finally {
            setIsLoading(false)
        }
    }

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
                        <div className='flex justify-between items-center'>
                            <div className='flex space-x-4'>
                                <input
                                    type='file'
                                    name=''
                                    id='image-upload'
                                    className='hidden'
                                    accept='image/*'
                                />
                                <Button
                                    variant='ghost'
                                    type='button'
                                    className='text-blue-500 hover:text-blue-600 p-2'
                                >
                                    <ImageIcon className='w-5 h-5' />
                                </Button>
                            </div>
                            <div className='flex items-center space-x-3'>
                                <span className='text-sm text-muted-foreground'>
                                    {content.length}/280
                                </span>

                                {/* Reply */}

                                <Button
                                    type='submit'
                                    className='rounded-full px-6'
                                    disabled={
                                        !content.trim() || content.length > 280
                                    }
                                >
                                    Tweet
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
