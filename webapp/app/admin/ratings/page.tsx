"use client";

import { useEffect, useState, useCallback } from "react";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { getAllRatings, updateRating, deleteRating, approveRating, rejectRating, IRating } from "@/lib/api/entities/ratings";
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { useAdminPage } from "@/hooks/use-admin-page";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Check, X, Star } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Rating = IRating;

export default function RatingsPage() {
  const [selected, setSelected] = useState<Rating | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Rating | null>(null);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [approvalFilter, setApprovalFilter] = useState<string>("all");
  const { toast } = useToast();

  // Wrap fetchData in useCallback to prevent infinite loop
  const fetchRatingsData = useCallback(async (pageNum: number, size: number, search: string) => {
    const result = await getAllRatings({ 
      page: pageNum, 
      limit: size, 
      search,
      entityType: entityTypeFilter === 'all' ? undefined : entityTypeFilter,
      isApproved: approvalFilter === 'approved' ? true : approvalFilter === 'rejected' ? false : undefined
    });
    return {
      data: result.data || [],
      totalPages: result.totalPages || 1,
      total: result.total || 0,
    };
  }, [entityTypeFilter, approvalFilter]);

  // Use the custom hook for common admin page functionality
  const {
    data: ratings,
    searchTerm,
    page,
    setPage,
    pageSize,
    totalPages,
    isLoading: isDataLoading,
    handleSearchInputChange,
    handlePageSizeChange,
    fetchPaginatedData,
  } = useAdminPage<Rating>({
    fetchData: fetchRatingsData,
    pageSize: 10
  });

  // Refetch when filters change
  useEffect(() => {
    fetchPaginatedData(1, pageSize, searchTerm);
  }, [entityTypeFilter, approvalFilter, fetchPaginatedData, pageSize, searchTerm]);

  const handleSave = async (data: Partial<Rating>) => {
    try {
      if (selected && selected._id) {
        await updateRating(selected._id, data);
        toast({ title: 'Success', description: 'Rating updated successfully' });
      }
      await fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.error || 'Failed to save rating', 
        variant: 'destructive' 
      });
    } finally {
      setOpenModal(false);
      setSelected(null);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget?._id) {
      try {
        await deleteRating(deleteTarget._id);
        toast({ title: 'Success', description: 'Rating deleted successfully' });
        await fetchPaginatedData(page, pageSize, searchTerm);
      } catch (error: any) {
        toast({ 
          title: 'Error', 
          description: error?.response?.data?.error || 'Failed to delete rating', 
          variant: 'destructive' 
        });
      } finally {
        setDeleteTarget(null);
      }
    }
  };

  const handleApprove = async (rating: Rating) => {
    try {
      await approveRating(rating._id);
      toast({ title: 'Success', description: 'Rating approved successfully' });
      await fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.error || 'Failed to approve rating', 
        variant: 'destructive' 
      });
    }
  };

  const handleReject = async (rating: Rating) => {
    try {
      await rejectRating(rating._id);
      toast({ title: 'Success', description: 'Rating rejected successfully' });
      await fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.error || 'Failed to reject rating', 
        variant: 'destructive' 
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const columns: ColumnDef<Rating>[] = [
    {
      accessorKey: "userName",
      header: "User",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.userName}</div>
          {row.original.userEmail && (
            <div className="text-sm text-gray-500">{row.original.userEmail}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "entityType",
      header: "Entity Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.entityType}</Badge>
      ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => renderStars(row.original.rating),
    },
    {
      accessorKey: "review",
      header: "Review",
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.review}>
          {row.original.review || '-'}
        </div>
      ),
    },
    {
      accessorKey: "isApproved",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isApproved ? "default" : "destructive"}>
          {row.original.isApproved ? "Approved" : "Rejected"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const rating = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelected(rating);
                setOpenModal(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            {!rating.isApproved && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApprove(rating)}
                className="text-green-600 hover:text-green-700"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            {rating.isApproved && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReject(rating)}
                className="text-orange-600 hover:text-orange-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(rating)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <AdminPageLayout
      title="Ratings & Reviews"
      searchTerm={searchTerm}
      onSearchChange={handleSearchInputChange}
      searchPlaceholder="Search ratings..."
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      isLoading={isDataLoading}
      data={ratings}
      columns={columns}
      emptyStateTitle="No ratings found"
      emptyStateMessage="There are no ratings yet."
      customFilters={
        <div className="flex gap-4">
          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by entity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="subject">Subject</SelectItem>
              <SelectItem value="chapter">Chapter</SelectItem>
              <SelectItem value="topic">Topic</SelectItem>
              <SelectItem value="gb_category">GB Category</SelectItem>
              <SelectItem value="gb_topic">GB Topic</SelectItem>
              <SelectItem value="gb_subtopic">GB Subtopic</SelectItem>
              <SelectItem value="gb_question">GB Question</SelectItem>
            </SelectContent>
          </Select>
          <Select value={approvalFilter} onValueChange={setApprovalFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      {/* Edit Rating Modal */}
      <EntityFormModal
        title="Edit Rating"
        open={openModal}
        onOpenChange={setOpenModal}
      >
        {selected && (
          <RatingEditForm 
            rating={selected} 
            onSubmit={handleSave} 
            loading={isDataLoading} 
          />
        )}
      </EntityFormModal>
      
      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete Rating"
        description={`Are you sure you want to delete this rating by "${deleteTarget?.userName}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </AdminPageLayout>
  );
}

// Rating Edit Form Component
function RatingEditForm({ 
  rating, 
  onSubmit, 
  loading 
}: { 
  rating: Rating; 
  onSubmit: (data: Partial<Rating>) => void; 
  loading: boolean; 
}) {
  const [formData, setFormData] = useState({
    userName: rating.userName,
    userEmail: rating.userEmail || '',
    rating: rating.rating,
    review: rating.review || '',
    isApproved: rating.isApproved
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="userName">User Name</Label>
        <Input
          id="userName"
          value={formData.userName}
          onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="userEmail">User Email</Label>
        <Input
          id="userEmail"
          type="email"
          value={formData.userEmail}
          onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="rating">Rating (1-5)</Label>
        <Input
          id="rating"
          type="number"
          min="1"
          max="5"
          value={formData.rating}
          onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
          required
        />
      </div>

      <div>
        <Label htmlFor="review">Review</Label>
        <Textarea
          id="review"
          value={formData.review}
          onChange={(e) => setFormData({ ...formData, review: e.target.value })}
          rows={4}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isApproved"
          checked={formData.isApproved}
          onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
        />
        <Label htmlFor="isApproved">Approved</Label>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
