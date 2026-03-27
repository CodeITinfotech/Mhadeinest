import { useListPackages, useListActivities, useListBlogPosts, useListPendingBlogPosts } from "@workspace/api-client-react";
import { Package, Activity as ActivityIcon, FileText, Clock } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: packages } = useListPackages();
  const { data: activities } = useListActivities();
  const { data: blogs } = useListBlogPosts({ query: { limit: 1 } });
  const { data: pendingBlogs } = useListPendingBlogPosts();

  const stats = [
    { name: "Active Packages", value: packages?.filter(p => p.isActive).length || 0, icon: Package, href: "/admin/packages", color: "text-blue-500", bg: "bg-blue-100" },
    { name: "Activities", value: activities?.length || 0, icon: ActivityIcon, href: "/admin/activities", color: "text-green-500", bg: "bg-green-100" },
    { name: "Total Blog Posts", value: blogs?.total || 0, icon: FileText, href: "/admin/blog", color: "text-purple-500", bg: "bg-purple-100" },
    { name: "Pending Approvals", value: pendingBlogs?.length || 0, icon: Clock, href: "/admin/blog", color: "text-orange-500", bg: "bg-orange-100" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Overview</h2>
        <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening on your website.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Link key={i} href={stat.href} className="block">
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all hover:border-primary/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.name}</p>
                  <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {pendingBlogs && pendingBlogs.length > 0 && (
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Action Required</h3>
          <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-500" />
              <p>You have <strong>{pendingBlogs.length}</strong> new blog posts waiting for approval.</p>
            </div>
            <Link href="/admin/blog" className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors">
              Review Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
