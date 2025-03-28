'use client'

import { Button, Card } from '@/components/ui'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SharePage({ params }: { params: { id: string } }) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !message.trim()) {
      alert('이름과 메시지를 모두 입력해주세요.')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // 실제 구현에서는 params.id를 사용하여 특정 타임캡슐에 메시지를 저장
      const { error } = await supabase
        .from('friend_messages')
        .insert({
          time_capsule_id: params.id,
          sender_name: name,
          message_content: message
        })
        
      if (error) throw error
      
      setIsSubmitted(true)
    } catch (error) {
      console.error('메시지 저장 오류:', error)
      alert('메시지 저장 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💌</span>
              </div>
              <h1 className="text-2xl font-bold text-cream-900 mb-2">메시지가 전송되었습니다!</h1>
              <p className="text-gray-600">
                당신의 메시지는 5년 후 타임밥슐이 열릴 때 함께 전달됩니다.
              </p>
            </div>
            
            <div className="text-center">
              <Button onClick={() => router.push('/')}>
                홈으로 돌아가기
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-cream-900 mb-2">
              친구에게 미래의 메시지 남기기
            </h1>
            <p className="text-gray-600">
              이 메시지는 5년 후 타임밥슐이 열릴 때 함께 전달됩니다.
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-cream-600"
                placeholder="당신의 이름을 입력하세요"
                maxLength={50}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">메시지</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-cream-600 h-32 resize-none"
                placeholder="미래에 전하고 싶은 메시지를 작성해보세요..."
                maxLength={300}
                required
              ></textarea>
              <p className="text-right text-gray-500 text-sm">
                {message.length}/300
              </p>
            </div>
            
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              메시지 보내기
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
} 