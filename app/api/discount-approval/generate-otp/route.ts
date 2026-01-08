
import { generateApprovalOtp } from "@/lib/discount"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { requestId } = await req.json()
        if (!requestId) return new NextResponse("Missing requestId", { status: 400 })

        await generateApprovalOtp(requestId)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("[GENERATE_OTP_ERROR]", error)
        return new NextResponse(error.message, { status: 500 })
    }
}
