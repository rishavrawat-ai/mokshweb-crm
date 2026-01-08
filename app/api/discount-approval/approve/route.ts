
import { verifyOtpAndApprove } from "@/lib/discount"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { requestId, otp } = await req.json()

        if (!requestId || !otp) {
            return new NextResponse("Missing requestId or otp", { status: 400 })
        }

        await verifyOtpAndApprove(requestId, otp)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("[APPROVE_ERROR]", error)
        return new NextResponse(error.message, { status: 500 }) // Frontend handles specific messages
    }
}
