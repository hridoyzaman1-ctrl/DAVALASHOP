import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useNewsletterSubscribers, useDeleteSubscriber } from "@/hooks/useNewsletter";
import { format } from "date-fns";
import { Trash2, Mail, Download } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const AdminNewsletter = () => {
    const { data: subscribers, isLoading } = useNewsletterSubscribers();
    const deleteSubscriber = useDeleteSubscriber();
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteSubscriber.mutateAsync(deleteId);
            toast.success("Subscriber removed successfully");
            setDeleteId(null);
        } catch (error) {
            toast.error("Failed to remove subscriber");
        }
    };

    const handleExport = () => {
        if (!subscribers) return;

        const csvContent = "data:text/csv;charset=utf-8,"
            + "Email,Status,Subscribed At\n"
            + subscribers.map(s => `${s.email},${s.is_active ? 'Active' : 'Unsubscribed'},${s.subscribed_at}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "newsletter_subscribers.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AdminLayout title="Newsletter Subscribers">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">
                        Total Subscribers: {subscribers?.length || 0}
                    </span>
                </div>
                <Button variant="outline" onClick={handleExport} disabled={!subscribers?.length}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <div className="bg-background rounded-lg border border-border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Subscribed Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">
                                    Loading subscribers...
                                </TableCell>
                            </TableRow>
                        ) : subscribers?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">
                                    No subscribers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            subscribers?.map((subscriber) => (
                                <TableRow key={subscriber.id}>
                                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={subscriber.is_active ? "default" : "secondary"}>
                                            {subscriber.is_active ? "Active" : "Unsubscribed"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(subscriber.subscribed_at), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => setDeleteId(subscriber.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This subscriber will be permanently removed from your list.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
};

export default AdminNewsletter;
