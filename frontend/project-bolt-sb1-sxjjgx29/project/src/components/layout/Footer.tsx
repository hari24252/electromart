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
    <footer className="mt-16 bg-ink-900 text-white">
      {/* Top CTA strip */}
      <div className="bg-accent-400 text-ink-900 border-b-2 border-ink-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-bold uppercase tracking-tight">Stay Charged Up</p>
              <p className="text-sm font-medium">Get exclusive deals and early access drops</p>
            </div>
            <form className="w-full md:w-auto" onSubmit={(event) => void subscribe(event)}>
              <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="flex-1 md:w-64 brutal-border bg-white px-4 py-2.5 text-ink-900 text-sm focus:outline-none focus:shadow-brutal"
              />
              <button type="submit" disabled={isSubscribing} className="brutal-border bg-ink-900 text-white px-6 py-2.5 font-bold text-sm uppercase shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-brutal-press transition-all disabled:cursor-not-allowed disabled:opacity-60">
                {isSubscribing ? 'Joining…' : 'Subscribe'}
              </button>
              </div>
              <label className="mt-2 flex items-start gap-2 text-xs font-medium">
                <input className="mt-0.5 h-3.5 w-3.5 accent-ink-900" type="checkbox" required />
                I agree to receive ElectroMart product news and offers. I can unsubscribe anytime.
              </label>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Logo size="md" className="text-white mb-4" />
            <p className="text-sm text-ink-300 mb-4">
              India's premier electronics destination. Real products, real prices, real fast.
            </p>
            <a href="mailto:support@electromart.com" className="inline-flex brutal-border bg-white px-3 py-2 text-xs font-bold uppercase text-ink-900 hover:bg-accent-400 transition-colors">Contact Support</a>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent-400 mb-3">Shop</h4>
            <ul className="space-y-2">
              <li><Link to="/catalog" className="text-sm text-ink-300 hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/catalog?search=smartphone" className="text-sm text-ink-300 hover:text-white transition-colors">Smartphones</Link></li>
              <li><Link to="/catalog?search=laptop" className="text-sm text-ink-300 hover:text-white transition-colors">Laptops</Link></li>
              <li><Link to="/catalog?search=audio" className="text-sm text-ink-300 hover:text-white transition-colors">Audio</Link></li>
              <li><Link to="/catalog?search=gaming" className="text-sm text-ink-300 hover:text-white transition-colors">Gaming</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent-400 mb-3">Account</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-sm text-ink-300 hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/signup" className="text-sm text-ink-300 hover:text-white transition-colors">Sign Up</Link></li>
              <li><Link to="/orders" className="text-sm text-ink-300 hover:text-white transition-colors">My Orders</Link></li>
              <li><Link to="/wishlist" className="text-sm text-ink-300 hover:text-white transition-colors">Wishlist</Link></li>
              <li><Link to="/addresses" className="text-sm text-ink-300 hover:text-white transition-colors">Addresses</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent-400 mb-3">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/orders" className="text-sm text-ink-300 hover:text-white transition-colors">Track Order</Link></li>
              <li><a href="mailto:support@electromart.com?subject=Returns%20request" className="text-sm text-ink-300 hover:text-white transition-colors">Returns</a></li>
              <li><a href="mailto:support@electromart.com?subject=Warranty%20support" className="text-sm text-ink-300 hover:text-white transition-colors">Warranty</a></li>
              <li><a href="mailto:support@electromart.com?subject=Frequently%20asked%20question" className="text-sm text-ink-300 hover:text-white transition-colors">FAQs</a></li>
              <li><a href="mailto:support@electromart.com" className="text-sm text-ink-300 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent-400 mb-3">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/catalog" className="text-sm text-ink-300 hover:text-white transition-colors">About ElectroMart</Link></li>
              <li><Link to="/admin" className="text-sm text-ink-300 hover:text-white transition-colors">Admin Portal</Link></li>
              <li><a href="mailto:support@electromart.com?subject=Careers" className="text-sm text-ink-300 hover:text-white transition-colors">Careers</a></li>
              <li><a href="mailto:support@electromart.com?subject=Privacy%20request" className="text-sm text-ink-300 hover:text-white transition-colors">Privacy Requests</a></li>
              <li><a href="mailto:support@electromart.com?subject=Terms%20of%20service" className="text-sm text-ink-300 hover:text-white transition-colors">Terms &amp; Support</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-ink-700 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-400">
            © {new Date().getFullYear()} ElectroMart. Built for the next generation of shoppers.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-400 uppercase tracking-wide">We Accept</span>
            <div className="flex gap-1.5">
              {['VISA', 'MC', 'UPI', 'COD'].map((p) => (
                <span key={p} className="brutal-border bg-white text-ink-900 px-2 py-1 text-2xs font-bold">
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
