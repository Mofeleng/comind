import { ResponsiveDialog } from "@/components/responsive-dialog";
import { SessionForm } from "./session-form";
import { useRouter } from "next/navigation";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const NewSessionDialog = ({open, onOpenChange}:Props) => {
    const router = useRouter();

    return (
        <ResponsiveDialog
            title="New Session"
            description="Create a new session to collaborate with your minds"
            open={open}
            onOpenChange={onOpenChange}
        >
            <SessionForm
                onSucces={(id) => {
                    onOpenChange(false);
                    router.push(`/sessions/${id}`);
                }}
                onCancel={() => onOpenChange}
            />
        </ResponsiveDialog>
    )
}