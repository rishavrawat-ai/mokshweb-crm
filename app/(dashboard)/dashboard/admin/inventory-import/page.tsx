import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import InventoryBulkImport from "@/components/dashboard/InventoryBulkImport";

export default async function InventoryImportPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    // Only ADMIN and SUPER_ADMIN can access
    if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
        redirect("/dashboard");
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <InventoryBulkImport />
        </div>
    );
}
