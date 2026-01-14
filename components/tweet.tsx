'use client'
import { formatTimeAgo, getInitials } from '@/lib/format-tweet-data'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react'
import { CldImage } from 'next-cloudinary'
import TweetComposer from './tweet/tweet-composer'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createReplyTweet, likeTweet, RTTweet } from '@/lib/actions/tweets'
import { toast } from 'sonner'

interface TweetProps {
    tweet: {
        id: string
        content: string
        imageUrl?: string | null
        createdAt: Date
        author: {
            id: string
            name: string
            username?: string | null
            avatar?: string | null
        }
        likes: Array<{ id: string; userId: string }>
        retweets: Array<{ id: string; userId: string }>
    }
    currentUserId?: string
}

export default function Tweet({ tweet, currentUserId }: TweetProps) {
    const [showReplyComposer, setShowReplyComposer] = useState<boolean>(false)
    const pathname = usePathname()
    const router = useRouter()

    const isLiked = currentUserId
        ? tweet.likes.some((like) => like.userId === currentUserId)
        : false

    const isRetweeted = currentUserId
        ? tweet.retweets.some((retweet) => retweet.userId === currentUserId)
        : false

    async function handleReply() {
        if (pathname === '/') {
            router.push(`/tweet/${tweet.id}`)
        } else {
            setShowReplyComposer((prev) => !prev)
        }
    }

    async function handleCreateReply(content: string, imageUrl?: string) {
        try {
            const result = await createReplyTweet(tweet.id, content, imageUrl)
            if (result.success) {
                router.refresh()
                setShowReplyComposer(false)
            }
        } catch (err) {
            toast.error('Error replying to the tweet :' + err)
        }
    }

    async function handleLike(tweetId: string) {
        try {
            const result = await likeTweet(tweetId)
            if (result.success) {
                router.refresh()
            }
        } catch (err) {
            console.error('Error liking tweet:', err)
        }
    }

    async function handleRT(tweetId: string) {
        try {
            const result = await RTTweet(tweetId)
            if (result.success) {
                router.refresh()
            }
        } catch (err) {
            console.error('Error RT tweet:', err)
        }
    }

    return (
        <>
            <div
                onClick={() => router.push(`/tweet/${tweet.id}`)}
                className='p-4 hover:bg-muted/50 cursor-pointer border-b border-border'
            >
                <div className='flex space-x-3'>
                    <Avatar>
                        <AvatarImage src={tweet.author.avatar ?? undefined} />
                        <AvatarFallback>
                            {getInitials(tweet.author.name)}
                        </AvatarFallback>
                    </Avatar>

                    <div className='flex-1 space-y-2'>
                        <div className='flex items-center space-x-2'>
                            <span className='font-semibold'>
                                {tweet.author.name}
                            </span>
                            <span className='text-muted-foreground'>
                                {tweet.author.username}
                            </span>
                            <span className='text-muted-foreground'>.</span>
                            <span className='text-muted-foreground'>
                                {formatTimeAgo(tweet.createdAt)}
                            </span>
                        </div>
                        <p className='text-foreground whitespace-pre-wrap'>
                            {tweet.content}
                        </p>

                        {tweet.imageUrl && (
                            <div className='mt-3'>
                                <CldImage
                                    src={tweet.imageUrl}
                                    alt='Tweet Image'
                                    width={800}
                                    height={600}
                                    className='max-w-full max-h-96 rounded-lg object-cover'
                                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                                />
                            </div>
                        )}

                        <div className='flex items-center gap-3'>
                            <Button
                                variant='ghost'
                                className='flex items-center space-x-2 hover:text-primary'
                                onClick={handleReply}
                            >
                                <MessageCircle className='h-4 w-4' />{' '}
                                <span>2</span>
                            </Button>
                            <Button
                                variant='ghost'
                                className='flex items-center space-x-2 hover:text-green-500'
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleRT(tweet.id)
                                }}
                            >
                                <Repeat2
                                    className={`h-4 w-4 ${
                                        isRetweeted && 'text-green-500 '
                                    }`}
                                />{' '}
                                <span>{tweet.retweets.length}</span>
                            </Button>
                            <Button
                                variant='ghost'
                                className='flex items-center space-x-2 hover:text-red-500'
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleLike(tweet.id)
                                }}
                            >
                                <Heart
                                    className={`h-4 w-4 ${
                                        isLiked && 'text-red-500 fill-red-500'
                                    }`}
                                />
                                <span>{tweet.likes.length}</span>
                            </Button>
                            <Button
                                variant='ghost'
                                className='flex items-center space-x-2 hover:text-primary'
                            >
                                <Share className='h-4 w-4' /> <span>1</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reply composer */}

            {showReplyComposer && (
                <div className='p-4 border-b border-border'>
                    <TweetComposer
                        placeholder='Tweet your reply...'
                        onCancel={() => setShowReplyComposer(false)}
                        onSubmit={handleCreateReply}
                    />
                </div>
            )}
        </>
    )
}
