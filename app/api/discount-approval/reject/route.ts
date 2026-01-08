
import { verifyOtpAndReject } from "@/lib/discount"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { requestId, otp, reason } = await req.json()

        if (!requestId || !otp || !reason) {
            return new NextResponse("Missing requestId, otp, or reason", { status: 400 })
        }

        await verifyOtpAndReject(requestId, otp, reason)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("[REJECT_ERROR]", error)
        return new NextResponse(error.message, { status: 500 })
    }
}
