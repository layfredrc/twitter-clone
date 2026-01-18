/*
  Warnings:

  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_actorId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_recipientId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_tweetId_fkey";

-- DropTable
DROP TABLE "Notification";

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipientId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "tweetId" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_recipientId_idx" ON "notifications"("recipientId");

-- CreateIndex
CREATE INDEX "notifications_recipientId_read_idx" ON "notifications"("recipientId", "read");

-- CreateIndex
CREATE INDEX "notifications_recipientId_createdAt_idx" ON "notifications"("recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "follows_followingId_idx" ON "follows"("followingId");

-- CreateIndex
CREATE INDEX "follows_followerId_idx" ON "follows"("followerId");

-- CreateIndex
CREATE INDEX "likes_tweetId_idx" ON "likes"("tweetId");

-- CreateIndex
CREATE INDEX "likes_userId_idx" ON "likes"("userId");

-- CreateIndex
CREATE INDEX "likes_userId_createdAt_idx" ON "likes"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "retweets_tweetId_idx" ON "retweets"("tweetId");

-- CreateIndex
CREATE INDEX "retweets_userId_idx" ON "retweets"("userId");

-- CreateIndex
CREATE INDEX "retweets_userId_createdAt_idx" ON "retweets"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "tweet_createdAt_idx" ON "tweet"("createdAt");

-- CreateIndex
CREATE INDEX "tweet_authorId_idx" ON "tweet"("authorId");

-- CreateIndex
CREATE INDEX "tweet_parentId_idx" ON "tweet"("parentId");

-- CreateIndex
CREATE INDEX "tweet_authorId_createdAt_idx" ON "tweet"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "user_username_idx" ON "user"("username");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "tweet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
