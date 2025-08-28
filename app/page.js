"use client";

import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import {
  Heart,
  Download,
  Star,
  Users,
  Gift,
  Camera,
  Music,
  FileText,
  Baby,
  GraduationCap,
  Crown,
  DollarSign,
  CheckCircle,
  Play,
  Upload,
  MessageCircle,
  Settings,
  Palette,
  User,
  LogOut,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [templates, setTemplates] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bundlesLoading, setBundlesLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [reqName, setReqName] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [reqDesc, setReqDesc] = useState("");
  const [reqSubmitting, setReqSubmitting] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchBundles();
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setUserLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const submitCustomRequest = async (e) => {
    e.preventDefault();
    if (!reqName || !reqEmail || !reqDesc) {
      alert("Please fill in Name, Email and Template Description.");
      return;
    }
    try {
      setReqSubmitting(true);
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Name: reqName,
          Email: reqEmail,
          TemplateDescription: reqDesc,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send request");
      }
      setReqName("");
      setReqEmail("");
      setReqDesc("");
      alert("Request sent successfully. We'll get back to you soon.");
    } catch (err) {
      alert(err.message || "Failed to send request");
    } finally {
      setReqSubmitting(false);
    }
  };

  const generateAvatarUrl = (name) => {
    const initials = name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      initials
    )}&backgroundColor=667eea,764ba2&textColor=ffffff`;
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates");
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBundles = async () => {
    try {
      const res = await fetch("/api/bundles");
      const data = await res.json();
      if (data.success) setBundles(data.bundles || []);
    } catch (e) {
      console.error("Error fetching bundles:", e);
    } finally {
      setBundlesLoading(false);
    }
  };

  const resellerBenefits = [
    "Earn 30% commission on every sale",
    "Access to exclusive templates",
    "Marketing materials provided",
    "Dedicated support team",
    "Analytics dashboard",
    "Early access to new products",
  ];

  const resellerPackages = [
    {
      name: "Starter",
      price: "Free",
      commission: "20%",
      features: ["Basic templates", "Email support", "Standard marketing kit"],
    },
    {
      name: "Professional",
      price: "$49/month",
      commission: "25%",
      features: [
        "Premium templates",
        "Priority support",
        "Advanced marketing kit",
        "Custom branding",
      ],
    },
    {
      name: "Enterprise",
      price: "$99/month",
      commission: "30%",
      features: [
        "All templates",
        "24/7 support",
        "Full marketing suite",
        "White-label options",
      ],
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Mother of two",
      content:
        "The Baby First Year template helped me capture every precious moment. It's beautiful and easy to use!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Wedding photographer",
      content:
        "I recommend Legacy Capsule to all my clients. The wedding memory books are absolutely stunning.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Family historian",
      content:
        "Creating our family recipe collection brought tears to my grandmother's eyes. Priceless memories preserved.",
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: "How do I customize my PDF template?",
      answer:
        "Our templates come with easy-to-use customization tools. You can add photos, text, change colors, and even upload your own music to create a truly personal experience.",
    },
    {
      question: "Can I share my completed PDF with family members?",
      answer:
        "Yes! Once you complete your PDF, you can easily share it via email, download it for printing, or store it digitally for future generations.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "We offer a 30-day money-back guarantee. If you're not satisfied with your purchase, we'll refund your money, no questions asked.",
    },
    {
      question: "How long does it take to receive my PDF?",
      answer:
        "All our templates are available for instant download after purchase. You can start customizing immediately!",
    },
  ];

  const handleBuyTemplate = async (templateId) => {
    try {
      const response = await fetch("/api/payment/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId,
          successUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
        }),
      });

      const data = await response.json();
      if (data.success && data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    } catch (error) {
      console.error("Error creating payment session:", error);
    }
  };

  const handleBuyBundle = async (bundleId) => {
    try {
      const response = await fetch("/api/payment/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bundleId,
          successUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
        }),
      });
      const data = await response.json();
      if (data.success && data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    } catch (e) {
      console.error("Error creating bundle payment session:", e);
    }
  };

  const handleDownloadTemplate = async (templateId) => {
    try {
      const response = await fetch(`/api/templates/download/${templateId}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = data.fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        if (data.error === "Purchase required to download this template") {
          alert("Please purchase this template to download it.");
        } else {
          alert("Error downloading template: " + data.error);
        }
      }
    } catch (error) {
      console.error("Error downloading template:", error);
      alert("Error downloading template");
    }
  };

  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Header */}
      <header className='bg-white shadow-sm sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-3'>
              <img
                src='/logo.jpeg'
                alt='Legacy Capsule'
                className='w-10 h-10 rounded-lg object-cover'
              />
              <span className='text-2xl font-bold text-black'>
                Legacy Capsule
              </span>
            </div>
            <nav className='hidden md:flex space-x-8'>
              <a
                href='#templates'
                className='text-black hover:text-blue-600 cursor-pointer'
              >
                Templates
              </a>
              <a
                href='#bundles'
                className='text-black hover:text-blue-600 cursor-pointer'
              >
                Bundles
              </a>
              <a
                href='#reseller'
                className='text-black hover:text-blue-600 cursor-pointer'
              >
                Reseller
              </a>
              <a
                href='#contact'
                className='text-black hover:text-blue-600 cursor-pointer'
              >
                Contact
              </a>
            </nav>
            <div className='flex items-center space-x-4'>
              {userLoading ? (
                <div className='animate-pulse bg-slate-200 h-8 w-20 rounded'></div>
              ) : user ? (
                <div className='flex items-center space-x-3'>
                  <div className='flex items-center space-x-2'>
                    <img
                      src={generateAvatarUrl(user.name)}
                      alt={user.name}
                      className='w-8 h-8 rounded-full'
                    />
                    <span className='text-sm text-black hidden sm:block'>
                      {user.name}
                    </span>
                  </div>
                  {user.role === "admin" && (
                    <Link href='/admin'>
                      <Button variant='outline' size='sm'>
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button variant='outline' size='sm' onClick={handleLogout}>
                    <LogOut className='w-4 h-4' />
                  </Button>
                </div>
              ) : (
                <>
                  <Link href='/auth/login'>
                    <Button variant='outline'>Sign In</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='hero-gradient text-white py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <div className='mb-8'>
            <div className='w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6'>
              <Heart className='w-12 h-12 text-white' />
            </div>
            <h1 className='text-5xl md:text-6xl font-bold mb-6'>
              Preserve Your Legacy
            </h1>
            <p className='text-xl md:text-2xl mb-8 max-w-3xl mx-auto'>
              Create beautiful, interactive PDF time capsules filled with
              memories, photos, and messages for your loved ones
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button
                size='lg'
                className='bg-white text-blue-600 hover:bg-slate-100'
              >
                Browse Templates
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Explanation Video Section */}
      <section className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-black mb-4'>
              How Legacy Capsule Works
            </h2>
            <p className='text-xl text-black max-w-3xl mx-auto'>
              Watch this short video to see how easy it is to create your own
              digital time capsule
            </p>
          </div>
          <div className='max-w-4xl mx-auto'>
            <div className='bg-slate-200 rounded-xl aspect-video flex items-center justify-center'>
              <div className='text-center'>
                <Play className='w-20 h-20 text-slate-400 mx-auto mb-4' />
                <p className='text-black'>Demo Video Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Our PDFs Section */}
      <section className='py-20 bg-slate-50 text-black'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-black mb-4'>
              Why Choose Our PDF Templates?
            </h2>
            <p className='text-xl text-black max-w-3xl mx-auto'>
              Beautiful designs, easy customization, and instant downloads make
              preserving memories simple
            </p>
          </div>
          <div className='grid md:grid-cols-3 gap-8'>
            <div className='feature-card text-center'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Palette className='w-8 h-8 text-blue-600' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>Beautiful Designs</h3>
              <p className='text-black'>
                Professionally crafted templates that look stunning on any
                device
              </p>
            </div>
            <div className='feature-card text-center'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Settings className='w-8 h-8 text-green-600' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>Easy Customization</h3>
              <p className='text-black'>
                Simple tools to add photos, text, and personalize your memories
              </p>
            </div>
            <div className='feature-card text-center'>
              <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Download className='w-8 h-8 text-purple-600' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>Instant Downloads</h3>
              <p className='text-black'>
                Get your template immediately after purchase and start creating
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium PDFs Showcase */}
      <section id='templates' className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-black mb-4'>
              Premium PDF Templates
            </h2>
            <p className='text-xl text-black max-w-3xl mx-auto'>
              Choose from our collection of beautifully designed templates for
              every occasion
            </p>
          </div>

          {loading ? (
            <div className='text-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
              <p className='mt-4 text-black'>Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-black'>
                No templates available yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {templates.map((template) => (
                <Card key={template._id} className='pricing-card'>
                  <CardHeader className='text-center'>
                    {template.imageUrl ? (
                      <div className='mb-4'>
                        <img
                          src={template.imageUrl}
                          alt={template.title}
                          className='w-full h-32 object-cover rounded-lg mx-auto'
                        />
                      </div>
                    ) : (
                      <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <FileText className='w-8 h-8 text-blue-600' />
                      </div>
                    )}
                    <CardTitle>{template.title}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='text-center mb-6'>
                      <span className='text-4xl font-bold text-black'>
                        ${template.price}
                      </span>
                    </div>
                    <ul className='space-y-2 mb-6'>
                      {template.features.slice(0, 4).map((feature, index) => (
                        <li
                          key={index}
                          className='flex items-center text-sm text-black'
                        >
                          <CheckCircle className='w-4 h-4 text-green-500 mr-2' />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className='space-y-2'>
                      <Button
                        className='w-full'
                        onClick={() => handleBuyTemplate(template._id)}
                      >
                        Buy Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bundle Deals Section */}
      <section id='bundles' className='py-20 bg-slate-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-black mb-4'>Bundle Deals</h2>
            <p className='text-xl text-black max-w-3xl mx-auto'>
              Save big with our carefully curated bundles for different life
              occasions
            </p>
          </div>
          {bundlesLoading ? (
            <div className='text-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
              <p className='mt-4 text-black'>Loading bundles...</p>
            </div>
          ) : bundles.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-black'>No bundles available right now.</p>
            </div>
          ) : (
            <div className='grid md:grid-cols-3 gap-8'>
              {bundles.map((bundle) => (
                <Card key={bundle._id} className='pricing-card relative'>
                  <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                    <span className='bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold'>
                      Save {bundle.savingsPercent}% ($
                      {Math.max(
                        0,
                        (bundle.originalTotal || 0) - (bundle.bundlePrice || 0)
                      )}
                      )
                    </span>
                  </div>
                  <CardHeader className='text-center'>
                    <CardTitle>{bundle.title}</CardTitle>
                    <CardDescription>{bundle.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='text-center mb-6'>
                      <span className='text-4xl font-bold text-black'>
                        ${bundle.bundlePrice}
                      </span>
                      <span className='text-lg text-black line-through ml-2'>
                        ${bundle.originalTotal}
                      </span>
                    </div>
                    <ul className='space-y-2 mb-6'>
                      {bundle.templateIds.map((t) => (
                        <li
                          key={t._id}
                          className='flex items-center text-sm text-black'
                        >
                          <CheckCircle className='w-4 h-4 text-green-500 mr-2' />
                          {t.title} (${t.price})
                        </li>
                      ))}
                    </ul>
                    <Button
                      className='w-full'
                      onClick={() => handleBuyBundle(bundle._id)}
                    >
                      Get Bundle
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Customization Section */}
      <section className='py-20 bg-white text-black'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            <div>
              <h2 className='text-4xl font-bold text-black mb-6'>
                Need Something Custom?
              </h2>
              <p className='text-xl text-black mb-8'>
                Can't find the perfect template? We'll create a custom design
                just for you. Whether it's a unique family tradition or a
                special occasion, we'll make it happen.
              </p>
              <Button size='lg'>Request a Quote</Button>
            </div>
            <div className='bg-slate-50 rounded-xl p-8'>
              <h3 className='text-2xl font-semibold mb-6'>
                Custom Template Request
              </h3>
              <form className='space-y-4' onSubmit={submitCustomRequest}>
                <div>
                  <label className='block text-sm font-medium text-black mb-2'>
                    Name
                  </label>
                  <input
                    type='text'
                    className='w-full px-3 py-2 border border-slate-300 rounded-md'
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-black mb-2'>
                    Email
                  </label>
                  <input
                    type='email'
                    className='w-full px-3 py-2 border border-slate-300 rounded-md'
                    value={reqEmail}
                    onChange={(e) => setReqEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-black mb-2'>
                    Template Description
                  </label>
                  <textarea
                    rows='4'
                    className='w-full px-3 py-2 border border-slate-300 rounded-md'
                    value={reqDesc}
                    onChange={(e) => setReqDesc(e.target.value)}
                  ></textarea>
                </div>
                <Button
                  type='submit'
                  className='w-full'
                  disabled={reqSubmitting}
                >
                  {reqSubmitting ? "Sending..." : "Submit Request"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Reseller Program Section */}
      <section id='reseller' className='py-20 bg-slate-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-12 items-center mb-16'>
            <div>
              <h2 className='text-4xl font-bold text-black mb-6'>
                Reseller Program
              </h2>
              <p className='text-xl text-black mb-8'>
                Earn money selling our premium PDF templates to your audience.
                Join thousands of successful resellers who are building their
                business with Legacy Capsule.
              </p>
              <Button size='lg'>Join Reseller Program</Button>
            </div>
            <div className='bg-slate-200 rounded-xl aspect-video flex items-center justify-center'>
              <div className='text-center'>
                <Play className='w-20 h-20 text-slate-400 mx-auto mb-4' />
                <p className='text-black'>Reseller Program Video</p>
              </div>
            </div>
          </div>

          <div className='grid lg:grid-cols-2 gap-12'>
            <div>
              <h3 className='text-2xl font-semibold mb-6'>
                Why Become a Reseller?
              </h3>
              <ul className='space-y-3'>
                {resellerBenefits.map((benefit, index) => (
                  <li key={index} className='flex items-center text-black'>
                    <CheckCircle className='w-5 h-5 text-green-500 mr-3' />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className='text-2xl font-semibold mb-6'>Reseller Packages</h3>
              <div className='space-y-4'>
                {resellerPackages.map((pkg, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className='flex justify-between items-center'>
                        <CardTitle className='text-lg'>{pkg.name}</CardTitle>
                        <div className='text-right'>
                          <div className='text-2xl font-bold text-blue-600'>
                            {pkg.price}
                          </div>
                          <div className='text-sm text-black'>
                            {pkg.commission} commission
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className='space-y-2'>
                        {pkg.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className='flex items-center text-sm text-black'
                          >
                            <CheckCircle className='w-4 h-4 text-green-500 mr-2' />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Music Upload Section */}
      <section className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-4xl font-bold text-black mb-6'>
            Add Your Favorite Music
          </h2>
          <p className='text-xl text-black mb-8 max-w-3xl mx-auto'>
            Upload your favorite songs to make your PDF memories even more
            special. Create the perfect soundtrack for your life stories.
          </p>
          <div className='max-w-md mx-auto'>
            <div className='border-2 border-dashed border-slate-300 rounded-lg p-8 hover:border-blue-500 transition-colors'>
              <Upload className='w-12 h-12 text-slate-400 mx-auto mb-4' />
              <p className='text-black mb-4'>
                Drag and drop your music files here
              </p>
              <Button>Choose Files</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className='py-20 bg-slate-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-black mb-4'>
              What Our Customers Say
            </h2>
            <p className='text-xl text-black max-w-3xl mx-auto'>
              Hear from families who have preserved their memories with Legacy
              Capsule
            </p>
          </div>
          <div className='grid md:grid-cols-3 gap-8'>
            {testimonials.map((testimonial, index) => (
              <Card key={index} className='text-center'>
                <CardContent className='pt-6'>
                  <div className='flex justify-center mb-4'>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className='w-5 h-5 text-yellow-400 fill-current'
                      />
                    ))}
                  </div>
                  <p className='text-black mb-4 italic'>
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className='font-semibold text-black'>
                      {testimonial.name}
                    </p>
                    <p className='text-sm text-black'>{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className='py-20 bg-white'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-black mb-4'>
              Frequently Asked Questions
            </h2>
            <p className='text-xl text-black'>
              Everything you need to know about Legacy Capsule
            </p>
          </div>
          <div className='space-y-6'>
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className='text-lg'>{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-black'>{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id='contact' className='bg-slate-900 text-white py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid md:grid-cols-4 gap-8 mb-8'>
            <div>
              <div className='flex items-center space-x-3 mb-4'>
                <img
                  src='/logo.jpeg'
                  alt='Legacy Capsule'
                  className='w-10 h-10 rounded-lg object-cover'
                />
                <span className='text-2xl font-bold'>Legacy Capsule</span>
              </div>
              <p className='text-slate-300 mb-4'>
                Preserving moments that matter through beautifully designed PDF
                templates
              </p>
              <div className='space-y-2'>
                <Button size='sm' className='w-full'>
                  Browse Templates
                </Button>
                <Button size='sm' variant='outline' className='w-full'>
                  Request Custom Design
                </Button>
              </div>
            </div>

            <div>
              <h3 className='text-lg font-semibold mb-4'>Products</h3>
              <ul className='space-y-2 text-slate-300'>
                <li>
                  <a href='#' className='hover:text-white cursor-pointer'>
                    Individual Templates
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white cursor-pointer'>
                    Bundle Deals
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white cursor-pointer'>
                    Custom Designs
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white cursor-pointer'>
                    Reseller Program
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className='text-lg font-semibold mb-4'>Resources</h3>
              <ul className='space-y-2 text-slate-300'>
                <li>
                  <a href='#' className='hover:text-white cursor-pointer'>
                    Tutorials
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white cursor-pointer'>
                    Design Guide
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white cursor-pointer'>
                    Support Center
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white cursor-pointer'>
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className='text-lg font-semibold mb-4'>Contact</h3>
              <ul className='space-y-2 text-slate-300'>
                <li>Email: hello@legacycapsule.com</li>
                <li>Phone: (555) 123-4567</li>
                <li>Hours: Mon-Fri 9AM-6PM</li>
              </ul>
            </div>
          </div>

          <div className='border-t border-slate-800 pt-8 text-center'>
            <p className='text-slate-400'>
              © 2024 Legacy Capsule. All rights reserved. Start preserving your
              legacy today.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
