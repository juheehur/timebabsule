'use client'

import { Card } from '@/components/ui'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col justify-center items-center">
      <div className="max-w-md w-full">
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center mb-8">
            <Image
              src="/images/logo.svg"
              alt="타임밥슐 로고"
              width={140}
              height={48}
              className="mb-6"
            />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">로그인이 필요해요</h1>
            <p className="text-gray-600 text-center mb-4">
              5년 후, 소중한 추억을 안전하게 전달하기 위해<br />
              구글 계정으로 로그인해 주세요
            </p>
            <div className="bg-red-50 p-4 rounded-lg text-sm text-gray-700 mb-2">
              <p>
                로그인하면 타임밥슐을 안전하게 보관하고, 개봉일이 되면 알림을 받을 수 있어요.
                최대 3개까지 타임밥슐을 만들 수 있답니다!
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <GoogleLoginButton />
            
            <div className="text-center mt-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-500 hover:text-gray-800 text-sm"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 