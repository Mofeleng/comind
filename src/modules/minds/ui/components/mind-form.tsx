"use client";

import { useTRPC } from "@/trpc/client";
import { MindData } from "../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import z from "zod";
import { agentsInsertSchema } from "../../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
    onSucces?: () => void;
    onCancel?: () => void;
    initialValues?: MindData;
}

export const MindForm = ({ onCancel, onSucces, initialValues }:Props) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const createAgent = useMutation(trpc.minds.create.mutationOptions({
        onSuccess: async () => {
            await queryClient.invalidateQueries(trpc.minds.getMany.queryOptions({}));

            if (initialValues?.id) {
                await queryClient.invalidateQueries(trpc.minds.getOne.queryOptions({ id: initialValues.id }))
            }
            onSucces?.() //close  dialog
        },
        onError: (error) => {
            toast.error(error.message);
        },
    }));

    const form = useForm<z.infer<typeof agentsInsertSchema>>({
        resolver: zodResolver(agentsInsertSchema),
        defaultValues: {
            name: initialValues?.name || "",
            instructions: initialValues?.instructions || ""
        }
    });

    const isEdit = !!initialValues?.id; // check if initial values exist, we are editing if id exists
    const isPending = createAgent.isPending;

    const onSubmit = (data: z.infer<typeof agentsInsertSchema>) => {
        if (isEdit) {
            console.log("TODO: Update agent");
        } else {
            createAgent.mutate(data);
        }
    }

    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <GeneratedAvatar
                    seed={form.watch("name")}
                    variant="botttsNeutral"
                    className="border size-16"
                />
                <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="e.g English Tutor"/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    name="instructions"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder="e.g You are an experienced english tutor who helps non-native speakers get fluent at english."/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-between gap-x-2">
                    { onCancel && (
                        <Button
                            variant="ghost"
                            disabled={isPending}
                            type="button"
                            onClick={() => onCancel()}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        disabled={isPending}
                        type="submit"
                    >
                        { isEdit ? "Update" : "Create"}
                    </Button>
                </div>
            </form>
        </Form>
    )

}