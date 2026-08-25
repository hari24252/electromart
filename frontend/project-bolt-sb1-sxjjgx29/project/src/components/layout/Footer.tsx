import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';
import { useToast } from '@/components/ui/Toast';

export function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const subscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubscribing(true);
    try {
      await api.newsletter.subscribe(email);
      setEmail('');
      toast('success', 'You are on the list. Watch your inbox for new drops.');
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not subscribe');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="mt-16 border-t border-paper-300 bg-paper-100 text-ink-800">
      <div className="border-b border-paper-300">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-bold tracking-tight">Stay in the loop</p>
              <p className="mt-1 text-sm text-ink-600">New arrivals and useful offers, only when they matter.</p>
            </div>
            <form className="w-full md:w-auto" onSubmit={(event) => void subscribe(event)}>
              <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="flex-1 rounded-lg border border-paper-400 bg-white px-4 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 md:w-64"
              />
              <button type="submit" disabled={isSubscribing} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60">
                {isSubscribing ? 'Joining…' : 'Subscribe'}
              </button>
              </div>
              <label className="mt-2 flex items-start gap-2 text-xs text-ink-600">
                <input className="mt-0.5 h-3.5 w-3.5 accent-brand-500" type="checkbox" required />
                I agree to receive ElectroMart product news and offers. I can unsubscribe anytime.
              </label>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Logo size="md" className="mb-4" />
            <p className="mb-4 text-sm text-ink-600">
              India's premier electronics destination. Real products, real prices, real fast.
            </p>
            <a href="mailto:support@electromart.com" className="inline-flex rounded-lg border border-paper-400 bg-white px-3 py-2 text-xs font-semibold text-ink-800 hover:border-brand-200 hover:text-brand-600">Contact Support</a>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-600">Shop</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-ink-600 hover:text-brand-600">All Products</Link></li>
              <li><Link to="/?search=smartphone" className="text-sm text-ink-600 hover:text-brand-600">Smartphones</Link></li>
              <li><Link to="/?search=laptop" className="text-sm text-ink-600 hover:text-brand-600">Laptops</Link></li>
              <li><Link to="/?search=audio" className="text-sm text-ink-600 hover:text-brand-600">Audio</Link></li>
              <li><Link to="/?search=gaming" className="text-sm text-ink-600 hover:text-brand-600">Gaming</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-600">Account</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-sm text-ink-600 hover:text-brand-600">Login</Link></li>
              <li><Link to="/signup" className="text-sm text-ink-600 hover:text-brand-600">Sign Up</Link></li>
              <li><Link to="/orders" className="text-sm text-ink-600 hover:text-brand-600">My Orders</Link></li>
              <li><Link to="/wishlist" className="text-sm text-ink-600 hover:text-brand-600">Wishlist</Link></li>
              <li><Link to="/addresses" className="text-sm text-ink-600 hover:text-brand-600">Addresses</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-600">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/orders" className="text-sm text-ink-600 hover:text-brand-600">Track Order</Link></li>
              <li><a href="mailto:support@electromart.com?subject=Returns%20request" className="text-sm text-ink-600 hover:text-brand-600">Returns</a></li>
              <li><a href="mailto:support@electromart.com?subject=Warranty%20support" className="text-sm text-ink-600 hover:text-brand-600">Warranty</a></li>
              <li><a href="mailto:support@electromart.com?subject=Frequently%20asked%20question" className="text-sm text-ink-600 hover:text-brand-600">FAQs</a></li>
              <li><a href="mailto:support@electromart.com" className="text-sm text-ink-600 hover:text-brand-600">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-600">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-ink-600 hover:text-brand-600">About ElectroMart</Link></li>
              <li><Link to="/admin" className="text-sm text-ink-600 hover:text-brand-600">Admin Portal</Link></li>
              <li><a href="mailto:support@electromart.com?subject=Careers" className="text-sm text-ink-600 hover:text-brand-600">Careers</a></li>
              <li><a href="mailto:support@electromart.com?subject=Privacy%20request" className="text-sm text-ink-600 hover:text-brand-600">Privacy Requests</a></li>
              <li><a href="mailto:support@electromart.com?subject=Terms%20of%20service" className="text-sm text-ink-600 hover:text-brand-600">Terms &amp; Support</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-paper-300 pt-6 md:flex-row">
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} ElectroMart. Built for the next generation of shoppers.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wide text-ink-500">We Accept</span>
            <div className="flex gap-1.5">
              {['VISA', 'MC', 'UPI', 'COD'].map((p) => (
                <span key={p} className="rounded-md border border-paper-400 bg-white px-2 py-1 text-2xs font-semibold text-ink-700">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
