"use client";

import { useTRPC } from "@/trpc/client";
import { SessionData } from "../../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import z from "zod";
import { sessionsInsertSchema } from "../../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { CommandSelect } from "./command-select";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { NewMindDialog } from "@/modules/minds/ui/components/new-mind-dialog";

interface Props {
    onSucces?: (id?:string) => void;
    onCancel?: () => void;
    initialValues?: SessionData;
}

export const SessionForm = ({ onCancel, onSucces, initialValues }:Props) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const [ mindSearch, setMindSearch ] = useState("");
    const [ openNewMindDialog, setOpenNewMindDialog ] = useState(false);

    const minds = useQuery(trpc.minds.getMany.queryOptions({
        pageSize: 100,
        search: mindSearch
    }))

    const updateSession = useMutation(trpc.sessions.update.mutationOptions({
        onSuccess: async () => {
            await queryClient.invalidateQueries(trpc.sessions.getMany.queryOptions({}));

            if (initialValues?.id) {
                await queryClient.invalidateQueries(trpc.sessions.getOne.queryOptions({ id: initialValues.id }))
            }
            onSucces?.() //close  dialog
        },
        onError: (error) => {
            toast.error(error.message);
        },
    }));

    const createSession = useMutation(trpc.sessions.create.mutationOptions({
        onSuccess: async (data) => {
            await queryClient.invalidateQueries(trpc.sessions.getMany.queryOptions({}));

            onSucces?.(data.id) //close  dialog
        },
        onError: (error) => {
            toast.error(error.message);
        },
    }));


    const form = useForm<z.infer<typeof sessionsInsertSchema>>({
        resolver: zodResolver(sessionsInsertSchema),
        defaultValues: {
            name: initialValues?.name || "",
            mindId: initialValues?.mindId || ""
        }
    });

    const isEdit = !!initialValues?.id; // check if initial values exist, we are editing if id exists
    const isPending = createSession.isPending || updateSession.isPending;

    const onSubmit = (data: z.infer<typeof sessionsInsertSchema>) => {
        if (isEdit) {
            updateSession.mutate({ ...data, id: initialValues.id });
        } else {
            createSession.mutate(data);
        }
    }

    return (
        <>
            <NewMindDialog
                open={openNewMindDialog}
                onOpenChange={setOpenNewMindDialog}
            />
            <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g Consultation"/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="mindId"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mind</FormLabel>
                                <FormControl>
                                    <CommandSelect
                                        options={(minds.data?.items ?? []).map((mind) => ({
                                            id: mind.id,
                                            value: mind.id,
                                            children: (
                                                <div className="flex items-center gap-x-2">
                                                    <GeneratedAvatar
                                                        seed={mind.name}
                                                        variant="botttsNeutral"
                                                        className="border size-6"
                                                    />
                                                    <span>{mind.name}</span>
                                                </div>
                                            )
                                        }))}
                                        onSelect={field.onChange}
                                        onSearch={setMindSearch}
                                        value={field.value}
                                        placeholder="Select a mind"
                                    />
                                </FormControl>
                                <FormDescription>
                                    Didn&apos;t find what you&apos;re looking for? { " " }
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="hover:underline text-start pl-0 hover:bg-white"
                                        onClick={() => setOpenNewMindDialog(true)}
                                    >
                                        Create a new mind
                                    </Button>
                                </FormDescription>
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
        </>
    )

}