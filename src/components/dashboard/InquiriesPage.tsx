import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import emailjs from '@emailjs/browser';
import { Inquiry } from '@/types';
import {
  Search,
  Filter,
  Truck,
  Package,
  Globe,
  MessageSquare,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  Reply,
  Trash2,
  X,
  Loader2,
  Send,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface InquiriesPageProps {
  isDark: boolean;
}

const InquiriesPage: React.FC<InquiriesPageProps> = ({ isDark }) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');

  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Inquiry | null>(null);

  useEffect(() => {
    fetchInquiries();

    // Realtime subscription
    const channel = supabase
      .channel('inquiries-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inquiries',
        },
        (payload) => {
          console.log('Realtime change:', payload);
          if (payload.eventType === 'INSERT') {
            setInquiries((prev) => [payload.new as Inquiry, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setInquiries((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as Inquiry) : item))
            );
          } else if (payload.eventType === 'DELETE') {
            setInquiries((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInquiries = useMemo(() => {
    let result = [...inquiries];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(inq =>
        inq.customer_name.toLowerCase().includes(query) ||
        inq.customer_email.toLowerCase().includes(query) ||
        inq.subject?.toLowerCase().includes(query)
      );
    }

    if (statusFilter) {
      result = result.filter(inq => inq.status === statusFilter);
    }

    if (serviceFilter) {
      result = result.filter(inq => inq.service_type === serviceFilter);
    }

    return result;
  }, [inquiries, searchQuery, statusFilter, serviceFilter]);

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'truck_purchase': return Truck;
      case 'parcel_delivery': return Package;
      case 'international_shipping': return Globe;
      default: return MessageSquare;
    }
  };

  const getServiceLabel = (type: string) => {
    switch (type) {
      case 'truck_purchase': return 'Truck Purchase';
      case 'parcel_delivery': return 'Parcel Delivery';
      case 'international_shipping': return 'International Shipping';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'replied': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Get these from https://dashboard.emailjs.com/
  const EMAILJS_SERVICE_ID = 'service_hszvkd9';
  const EMAILJS_TEMPLATE_ID = 'template_7rwclw8';
  const EMAILJS_PUBLIC_KEY = '-IF4Ml2-yi9tkJwBn';

  const handleReply = async () => {
    console.log('handleReply called', { selectedInquiry, replyText });

    if (!selectedInquiry || !replyText.trim()) {
      console.warn('Missing inquiry or reply text');
      return;
    }

    setIsSending(true);
    try {
      // 1. Update Database First
      console.log('Attempting to update Supabase...');

      const { error: dbError } = await supabase
        .from('inquiries')
        .update({
          admin_reply: replyText,
          status: 'replied', // Strictly use 'replied' as per user request. If DB constraints fail, we must fail.
          replied_at: new Date().toISOString()
        })
        .eq('id', selectedInquiry.id);

      if (dbError) {
        console.error('Supabase update error:', dbError);
        // User-friendly error
        throw new Error('Could not save your reply. Please try again.');
      }

      console.log('Supabase update success');

      // 2. Send Email via EmailJS (Only if DB update succeeded)
      console.log('Attempting to send email via EmailJS...');

      // Validation check removed as keys are now set

      const templateParams = {
        // Variables required by your template:
        name: selectedInquiry.customer_name,    // Matches {{name}}
        response: replyText,                    // Matches {{response}}

        // Variables for EmailJS routing (Recipient):
        email: selectedInquiry.customer_email,  // Try standard 'email'
        to_email: selectedInquiry.customer_email, // Keep 'to_email' just in case

        // Other useful info
        to_name: selectedInquiry.customer_name,
        reply_message: replyText,
        subject: selectedInquiry.subject,
        from_email: 'Info@linarlogistic.co.uk', // Ensure the outgoing email has this sender name/address context
      };

      console.log('EmailJS Params:', templateParams); // Debug log

      if (!templateParams.email) {
        throw new Error("This customer does not have an email address.");
      }

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      console.log('Email sent successfully via EmailJS');

      toast.success("Email sent! Database status updated.");

      await fetchInquiries();
      setIsReplyModalOpen(false);
      setReplyText('');
      setSelectedInquiry(null);
    } catch (error: any) {
      console.error('Error in handleReply:', error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkResolved = async (inquiry: Inquiry) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status: 'resolved' })
        .eq('id', inquiry.id);

      if (error) throw error;
      await fetchInquiries();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (inquiry: Inquiry) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', inquiry.id);

      if (error) throw error;
      setInquiries(prev => prev.filter(i => i.id !== inquiry.id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      toast.error("Could not delete the inquiry. Please try again.");
    }
  };

  const inputClass = `
    w-full px-4 py-2.5 rounded-xl transition-all
    ${isDark
      ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500'
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-cyan-500'
    }
    border focus:outline-none focus:ring-2 focus:ring-cyan-500/20
  `;

  const stats = useMemo(() => ({
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'pending').length,
    replied: inquiries.filter(i => i.status === 'replied').length,
    resolved: inquiries.filter(i => i.status === 'resolved').length
  }), [inquiries]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Customer Inquiries
        </h2>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          Manage and respond to customer inquiries
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'cyan' },
          { label: 'Pending', value: stats.pending, color: 'yellow' },
          { label: 'Replied', value: stats.replied, color: 'blue' },
          { label: 'Resolved', value: stats.resolved, color: 'green' }
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className={`
              p-4 rounded-xl
              ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
            `}
          >
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{label}</p>
            <p className={`text-2xl font-bold text-${color}-500`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`
        p-4 rounded-2xl
        ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
      `}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputClass} pl-12`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${inputClass} w-full md:w-40`}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="replied">Replied</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className={`${inputClass} w-full md:w-48`}
          >
            <option value="">All Services</option>
            <option value="truck_purchase">Truck Purchase</option>
            <option value="parcel_delivery">Parcel Delivery</option>
            <option value="international_shipping">International Shipping</option>
          </select>
        </div>
      </div>

      {/* Inquiries List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className={`
          flex flex-col items-center justify-center h-64 rounded-2xl
          ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
        `}>
          <MessageSquare className={`w-12 h-12 mb-4 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
          <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            No inquiries found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => {
            const ServiceIcon = getServiceIcon(inquiry.service_type);
            return (
              <div
                key={inquiry.id}
                className={`
                  p-5 rounded-2xl transition-all
                  ${isDark
                    ? 'bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50'
                    : 'bg-white border border-gray-200 hover:border-cyan-500/50'
                  }
                `}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Icon */}
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                    ${inquiry.service_type === 'truck_purchase'
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : inquiry.service_type === 'parcel_delivery'
                        ? 'bg-pink-500/20 text-pink-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }
                  `}>
                    <ServiceIcon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {inquiry.customer_name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(inquiry.status)}`}>
                        {inquiry.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                        {getServiceLabel(inquiry.service_type)}
                      </span>
                    </div>

                    <p className={`font-medium mb-1 ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                      {inquiry.subject}
                    </p>
                    <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      {inquiry.message}
                    </p>

                    {/* Contact Info */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                        <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>
                          {inquiry.customer_email}
                        </span>
                      </div>
                      {inquiry.customer_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                          <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>
                            {inquiry.customer_phone}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                        <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>
                          {new Date(inquiry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Admin Reply */}
                    {inquiry.admin_reply && (
                      <div className={`
                        mt-4 p-3 rounded-xl
                        ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}
                      `}>
                        <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          Your Reply:
                        </p>
                        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                          {inquiry.admin_reply}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <button
                      onClick={() => {
                        setSelectedInquiry(inquiry);
                        setReplyText(inquiry.admin_reply || '');
                        setIsReplyModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                    >
                      <Reply className="w-4 h-4" />
                      <span className="text-sm">Reply</span>
                    </button>
                    {inquiry.status !== 'resolved' && (
                      <button
                        onClick={() => handleMarkResolved(inquiry)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Resolve</span>
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(inquiry)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply Modal */}
      {isReplyModalOpen && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsReplyModalOpen(false)}
          />
          <div className={`
            relative w-full max-w-lg p-6 rounded-2xl
            ${isDark ? 'bg-slate-800' : 'bg-white'}
            shadow-2xl animate-in zoom-in-95 duration-200
          `}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Reply to {selectedInquiry.customer_name}
              </h3>
              <button
                onClick={() => setIsReplyModalOpen(false)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`p-3 rounded-xl mb-4 ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                <strong>Subject:</strong> {selectedInquiry.subject}
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                {selectedInquiry.message}
              </p>
            </div>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              rows={5}
              className={`
                w-full px-4 py-3 rounded-xl mb-4
                ${isDark
                  ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                }
                border focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500
              `}
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsReplyModalOpen(false)}
                className={`
                  px-4 py-2 rounded-xl font-medium transition-colors
                  ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={isSending || !replyText.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className={`
            relative w-full max-w-md p-6 rounded-2xl
            ${isDark ? 'bg-slate-800' : 'bg-white'}
            shadow-2xl animate-in zoom-in-95 duration-200
          `}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Delete Inquiry
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className={`mb-6 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Are you sure you want to delete this inquiry from <strong>{deleteConfirm.customer_name}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className={`
                  px-4 py-2 rounded-xl font-medium transition-colors
                  ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiriesPage;
