/*
  Warnings:

  - You are about to drop the `Tweet` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tweet" DROP CONSTRAINT "Tweet_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Tweet" DROP CONSTRAINT "Tweet_parentId_fkey";

-- DropTable
DROP TABLE "Tweet";

-- CreateTable
CREATE TABLE "tweet" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tweet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tweet" ADD CONSTRAINT "tweet_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tweet" ADD CONSTRAINT "tweet_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "tweet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
