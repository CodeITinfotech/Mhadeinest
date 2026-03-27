import { useListPendingBlogPosts, useListBlogPosts, useApproveBlogPost, useDeleteBlogPost, getListPendingBlogPostsQueryKey, getListBlogPostsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Trash2, Eye } from "lucide-react";
import { Link } from "wouter";

export default function AdminBlog() {
  const { data: pending = [] } = useListPendingBlogPosts();
  const { data: publishedData } = useListBlogPosts({ query: { limit: 50 } });
  const published = publishedData?.posts || [];
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const approveMutation = useApproveBlogPost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPendingBlogPostsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListBlogPostsQueryKey() });
        toast({ title: "Approved", description: "Post is now live." });
      }
    }
  });

  const deleteMutation = useDeleteBlogPost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPendingBlogPostsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListBlogPostsQueryKey() });
        toast({ title: "Deleted", description: "Post removed." });
      }
    }
  });

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          Pending Approvals 
          {pending.length > 0 && <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">{pending.length}</span>}
        </h2>
        
        {pending.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
            No pending posts to review.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pending.map(post => (
              <div key={post.id} className="bg-card border border-orange-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span className="font-medium text-foreground">{post.authorName}</span>
                    <span>•</span>
                    <span>{post.authorEmail}</span>
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">{post.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 max-w-3xl">{post.content}</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button 
                    className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white" 
                    onClick={() => approveMutation.mutate({ id: post.id })}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                  </Button>
                  <Button 
                    variant="danger" 
                    className="flex-1 md:flex-none"
                    onClick={() => {
                      if (window.confirm("Reject and delete this post?")) deleteMutation.mutate({ id: post.id });
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Published Posts</h2>
          <Link href="/blog/submit"><Button variant="outline">Write New Admin Post</Button></Link>
        </div>
        
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Author</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {published.map(post => (
                <tr key={post.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">
                    {post.title}
                    {post.isAdminPost && <span className="ml-2 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full">Admin</span>}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{post.authorName}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="ghost" size="sm"><Eye className="w-4 h-4"/></Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => {
                      if (window.confirm("Delete this published post?")) deleteMutation.mutate({ id: post.id });
                    }}><Trash2 className="w-4 h-4"/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
