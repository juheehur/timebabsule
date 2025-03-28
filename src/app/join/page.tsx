import { Button, Card } from '@/components/ui'

export default function JoinPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <h1 className="text-2xl font-bold mb-6">QR코드 인증</h1>
          <p className="text-cream-700 mb-8">
            햇반 용기에 있는 QR코드를 스캔하여 타임밥슐을 만들어보세요.
          </p>
          
          <div className="mb-8">
            <div className="w-64 h-64 mx-auto bg-cream-100 rounded-lg flex items-center justify-center">
              <p className="text-cream-500">카메라 접근 권한 필요</p>
            </div>
          </div>

          <div className="space-y-4">
            <Button className="w-full">
              카메라 권한 허용하기
            </Button>
            <Button variant="outline" className="w-full">
              수동으로 QR코드 입력하기
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
} 