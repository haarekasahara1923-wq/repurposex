import Link from "next/link";
import { ArrowRight, Sparkles, Video, FileText, Zap, Users, BarChart, CheckCircle, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/5 backdrop-blur-lg border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">RepurposeX</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-300 hover:text-white transition">Features</Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</Link>
              <Link href="#testimonials" className="text-gray-300 hover:text-white transition">Testimonials</Link>
              <Link href="/login" className="text-gray-300 hover:text-white transition">Login</Link>
              <Link href="/signup" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">AI-Powered Content Repurposing</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Transform{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                One Piece
              </span>
              {" "}of Content Into{" "}
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 text-transparent bg-clip-text">
                100+ Posts
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              AI-powered platform that helps creators, agencies, and brands maximize ROI from existing content.
              Turn 1 podcast into 50 social posts, 10 videos, and 5 blog articles—in minutes, not days.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105 flex items-center justify-center gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#demo" className="px-8 py-4 bg-white/10 backdrop-blur text-white rounded-full text-lg font-semibold hover:bg-white/20 transition border border-white/20 flex items-center justify-center gap-2">
                See How It Works
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>5,000+ creators & agencies</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>4.9/5 rating on G2</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span>Average 7.5x content ROI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-300">
              Everything you need to maximize your content ROI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur border border-white/10 rounded-2xl hover:shadow-xl hover:shadow-purple-500/20 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Advanced Video AI</h3>
              <p className="text-gray-400 leading-relaxed">
                Viral moment detection, smart auto-framing, animated captions with 97% accuracy, and filler word removal.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur border border-white/10 rounded-2xl hover:shadow-xl hover:shadow-blue-500/20 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Brand Voice Intelligence</h3>
              <p className="text-gray-400 leading-relaxed">
                AI learns your brand voice from existing content and maintains consistency across all platforms.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur border border-white/10 rounded-2xl hover:shadow-xl hover:shadow-pink-500/20 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Platform Optimization</h3>
              <p className="text-gray-400 leading-relaxed">
                Perfect formats for Instagram Reels, LinkedIn, Twitter threads, YouTube Shorts, and TikTok.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-gradient-to-br from-green-500/10 to-blue-500/10 backdrop-blur border border-white/10 rounded-2xl hover:shadow-xl hover:shadow-green-500/20 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Agency Workflow</h3>
              <p className="text-gray-400 leading-relaxed">
                Client management, approval workflows, white-label branding, and team collaboration tools.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur border border-white/10 rounded-2xl hover:shadow-xl hover:shadow-yellow-500/20 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                <BarChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Analytics & ROI</h3>
              <p className="text-gray-400 leading-relaxed">
                Track performance, measure ROI, platform breakdowns, and automated weekly/monthly reports.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur border border-white/10 rounded-2xl hover:shadow-xl hover:shadow-purple-500/20 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Auto-Distribution</h3>
              <p className="text-gray-400 leading-relaxed">
                Schedule to 10+ platforms, AI-powered optimal posting times, and evergreen content queues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-300">
              Choose the plan that fits your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Creator Plan */}
            <div className="p-8 bg-white/5 backdrop-blur border border-white/10 rounded-2xl hover:border-purple-500/50 transition">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Creator</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">₹4,999</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-400 mt-2">Perfect for individual creators</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  10 video uploads/month
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  AI Clip Extraction
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  1,000 AI credits
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  2 Brand Voices
                </li>
              </ul>
              <Link href="/signup" className="block w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-center font-semibold transition">
                Start 7-Day Free Trial
              </Link>
            </div>

            {/* Pro Plan - Featured */}
            <div className="p-8 bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur border-2 border-purple-500 rounded-2xl relative transform scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-full">
                  MOST POPULAR
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">₹14,999</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-400 mt-2">For serious creators & small teams</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  50 video uploads/month
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  ROI Analytics Dashboard
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  5,000 AI credits
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  10 Brand Voices
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Priority Support
                </li>
              </ul>
              <Link href="/signup" className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/50 text-white rounded-xl text-center font-semibold transition">
                Start 7-Day Free Trial
              </Link>
            </div>

            {/* Agency Plan */}
            <div className="p-8 bg-white/5 backdrop-blur border border-white/10 rounded-2xl hover:border-purple-500/50 transition">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Agency</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">₹49,999</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-400 mt-2">Scale your content agency</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Unlimited uploads
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  25 Client Sub-accounts
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  White-label Client Portal
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Unlimited Team Members
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Custom AI Training
                </li>
              </ul>
              <Link href="/signup" className="block w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-center font-semibold transition">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Content Strategy?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join 5,000+ creators and agencies maximizing their content ROI
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-full text-lg font-semibold hover:shadow-2xl transition transform hover:scale-105">
            Start Free Trial - No Credit Card Required
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white/5 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2026 RepurposeX. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white transition">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
