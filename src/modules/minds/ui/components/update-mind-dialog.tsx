import { ResponsiveDialog } from "@/components/responsive-dialog";
import { MindForm } from "./mind-form";
import { MindData } from "../../types";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialvalues: MindData;
}

export const UpdateMindDialog = ({initialvalues, open, onOpenChange}:Props) => {
    return (
        <ResponsiveDialog
            title="Edit Mind"
            description="Edit Mind details"
            open={open}
            onOpenChange={onOpenChange}
        >
            <MindForm
                initialValues={initialvalues}
                onSucces={() => onOpenChange(false)}
                onCancel={() => onOpenChange(false)}
            />
        </ResponsiveDialog>
    )
}