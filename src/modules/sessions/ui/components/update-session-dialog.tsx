import { ResponsiveDialog } from "@/components/responsive-dialog";
import { SessionForm } from "./session-form";
import { SessionData } from "../../types";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialValues: SessionData;
}

export const UpdateSessionDialog = ({open, onOpenChange, initialValues }:Props) => {

    return (
        <ResponsiveDialog
            title="Edit Session"
            description="Update your session details"
            open={open}
            onOpenChange={onOpenChange}
        >
            <SessionForm
                onSucces={() => {onOpenChange(false);}}
                onCancel={() => onOpenChange(false)}
                initialValues={initialValues}
            />
        </ResponsiveDialog>
    )
}