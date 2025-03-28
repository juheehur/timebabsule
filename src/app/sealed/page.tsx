'use client'

import { Button, Card } from '@/components/ui'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function SealedPage() {
  const router = useRouter()
  const [openDate] = useState(() => {
    const date = new Date()
    date.setFullYear(date.getFullYear() + 5)
    return date
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <div className="space-y-8 py-4">
          {/* 봉인 완료 애니메이션 */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <span className="text-6xl">💌</span>
              <motion.div
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute -top-1 -right-1 text-2xl"
              >
                ✨
              </motion.div>
            </div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-gray-900"
            >
              타임밥슐이 봉인되었어요!
            </motion.h1>
          </motion.div>

          {/* 개봉 예정일 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <p className="text-gray-600">
              당신의 이야기는 안전하게 보관되어
              <br />이 날에 다시 찾아올 거예요
            </p>
            <p className="text-xl font-semibold text-pink-500">
              {openDate.getFullYear()}년 {openDate.getMonth() + 1}월 {openDate.getDate()}일
            </p>
          </motion.div>

          {/* 안내 메시지 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-pink-50 p-4 rounded-2xl text-sm text-gray-600"
          >
            <p>
              5년 후, 등록하신 이메일로
              <br />
              타임밥슐 개봉 알림을 보내드릴게요
            </p>
          </motion.div>

          {/* 버튼 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full rounded-full bg-pink-100 hover:bg-pink-200 text-gray-900 border-0"
            >
              내 타임밥슐 목록 보기
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/create-capsule')}
              className="w-full rounded-full border-pink-200 text-gray-600 hover:bg-pink-50"
            >
              새로운 타임밥슐 만들기
            </Button>
          </motion.div>
        </div>
      </Card>
    </div>
  )
} 