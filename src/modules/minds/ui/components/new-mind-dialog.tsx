import { ResponsiveDialog } from "@/components/responsive-dialog";
import { MindForm } from "./mind-form";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const NewMindDialog = ({open, onOpenChange}:Props) => {
    return (
        <ResponsiveDialog
            title="New Mind"
            description="Create a new mind to collaborate with"
            open={open}
            onOpenChange={onOpenChange}
        >
            <MindForm
                onSucces={() => onOpenChange(false)}
                onCancel={() => onOpenChange(false)}
            />
        </ResponsiveDialog>
    )
}