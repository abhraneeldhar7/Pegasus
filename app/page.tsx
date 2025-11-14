"use client"
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Menu, X, ArrowRight, Play, Shield, Users, FileSpreadsheet, ClipboardCheck, Smartphone, Clock, TrendingUp, Zap, Lock, BarChart3 } from "lucide-react";
import { useState } from "react";
// import heroImage from "@/assets/hero-exam-dashboard.jpg";
import Image from "next/image";
import Link from "next/link";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const adminFeatures = [
    {
      icon: Shield,
      title: "Secure Role-Based Access",
      description: "Enterprise-grade login with customizable role permissions. Control who sees what with granular access management.",
      highlight: "Bank-level security"
    },
    {
      icon: Users,
      title: "Department Management",
      description: "Set up and organize departments with one-click. Streamline course structures and faculty assignments effortlessly.",
      highlight: "One-click setup"
    },
    {
      icon: FileSpreadsheet,
      title: "Bulk Student Import",
      description: "Add students individually or import hundreds via CSV. Smart data validation catches errors before they become problems.",
      highlight: "CSV support with validation"
    },
    {
      icon: ClipboardCheck,
      title: "Smart Exam Creation",
      description: "Design custom assessments with MCQ, essays, and more. Schedule, publish, and monitor with anti-cheating measures built-in.",
      highlight: "Anti-cheat enabled"
    }
  ];

  const studentFeatures = [
    {
      icon: Smartphone,
      title: "Device-Agnostic Access",
      description: "Attempt exams seamlessly on laptops, tablets, or phones. Our adaptive UI ensures a consistent experience across all screen sizes.",
      stat: "Works on 99% of devices"
    },
    {
      icon: Clock,
      title: "Real-Time Progress",
      description: "Never lose your work. Auto-save keeps your progress secure, with live timers and question navigation at your fingertips.",
      stat: "Auto-saves every 30s"
    },
    {
      icon: TrendingUp,
      title: "Instant Detailed Results",
      description: "No more waiting weeks. Get comprehensive score breakdowns, question-by-question feedback, and performance analytics immediately after submission.",
      stat: "Results in <2 seconds"
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Efficiency",
      stat: "70%",
      description: "Reduce admin time with automated workflows",
      details: [
        "Auto-grading for objective questions",
        "Batch operations for bulk actions",
        "Scheduled exam publishing",
        "One-click report generation"
      ]
    },
    {
      icon: Lock,
      title: "Security",
      stat: "100%",
      description: "MySQL-backed encryption, GDPR-compliant",
      details: [
        "End-to-end data encryption",
        "Role-based access control",
        "Regular security audits",
        "GDPR & FERPA compliant"
      ]
    },
    {
      icon: BarChart3,
      title: "Insights",
      stat: "360°",
      description: "Generate reports on trends, attendance, outcomes",
      details: [
        "Performance analytics dashboard",
        "Trend analysis over time",
        "Exportable data reports",
        "Custom metric tracking"
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-gradient-hero p-2 rounded-lg">
                <Image src="/appLogo.png" className="
              object-contain h-[50px] w-[40px]" unoptimized alt="" height={60} width={60} />
              </div>
              <span className="text-xl font-bold text-foreground">Pegasus</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-[40px]">
              <a href="#features" className="text-foreground hover:text-primary transition-colors font-medium">
                Features
              </a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors font-medium">
                About
              </a>
              <a href="#team" className="text-foreground hover:text-primary transition-colors font-medium">
                Team
              </a>
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button>
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border animate-fade-in">
              <div className="flex flex-col gap-4">
                <a
                  href="#features"
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#benefits"
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </a>
                <a
                  href="#testimonials"
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Team
                </a>
                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/login">
                    <Button size="default" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-feature -z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 -z-10" />

          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-[20px] animate-fade-in">
                <div className="inline-block">
                  <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/20">
                    Online Exam System
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Revolutionize Exam Management -{" "}
                  <span className="bg-gradient-hero bg-clip-text text-transparent">
                    Secure, Instant, Effortless
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Empower your institution with Pegasus: From seamless admin workflows to real-time student results.
                  Reduce administrative burden, and deliver instant feedback.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/login">
                    <Button size="lg" className="group">
                      Get Started as Admin
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="group">
                      Join as Student
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
                  <div>
                    <div className="text-2xl md:text-3xl font-bold text-primary">70%</div>
                    <div className="text-sm text-muted-foreground">Time Saved</div>
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl font-bold text-primary">99.9%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl font-bold text-primary">500+</div>
                    <div className="text-sm text-muted-foreground">Institutions</div>
                  </div>
                </div>
              </div>

              {/* Right Content - Hero Image */}
              <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/heroImg.png"
                    height={100}
                    width={100}
                    alt="ExamHub dashboard showing exam creation and student results interface"
                    className="w-full h-auto object-cover"
                    unoptimized
                  />

                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Admin Features Section */}
        <section id="features" className="py-20 lg:py-32 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 animate-fade-in">
              <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/20">
                Admin Tools
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                Built for Educators, Designed for Scale
              </h2>
              <p className="text-lg text-muted-foreground">
                Comprehensive tools that reduce administrative overhead while maintaining complete control over your exam ecosystem.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {adminFeatures.map((feature, index) => (
                <Card
                  key={index}
                  className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border-border animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="space-y-4">
                    {/* Icon */}
                    <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-gradient-hero group-hover:text-primary-foreground transition-all">
                      <feature.icon className="h-6 w-6" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Highlight Badge */}
                    <div className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-semibold border border-accent/20">
                      {feature.highlight}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Visual Demo Section */}
            <div className="mt-16 rounded-2xl bg-gradient-feature border border-border p-8 lg:p-12 shadow-lg">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground">
                    CSV Import Made Simple
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Upload student data in seconds. Our intelligent validation system checks for duplicates,
                    missing fields, and format errors—giving you clear feedback before any data touches your database.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                    <ClipboardCheck className="h-5 w-5" />
                    <span>99.9% data accuracy rate</span>
                  </div>
                </div>
                <div className="bg-background/50 rounded-xl p-6 border-2 border-dashed border-primary/30 text-center hover:border-primary/60 transition-colors">
                  <FileSpreadsheet className="h-16 w-16 text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">
                    Drag & drop CSV or click to browse
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Student Experience Section */}
        <section id="testimonials" className="py-20 lg:py-32 bg-gradient-feature">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 animate-fade-in">
              <div className="inline-block bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-semibold border border-accent/20">
                Student Portal
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                Student-First: Attempt, Submit, Succeed – Instantly
              </h2>
              <p className="text-lg text-muted-foreground">
                A stress-free exam experience designed around students. Focus on knowledge, not technical difficulties.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {studentFeatures.map((feature, index) => (
                <Card
                  key={index}
                  className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border-border bg-background animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="space-y-4">
                    {/* Icon */}
                    <div className="inline-flex p-4 rounded-2xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all">
                      <feature.icon className="h-8 w-8" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-foreground">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Stat Badge */}
                    <div className="pt-2">
                      <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                        {feature.stat}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Testimonial Card */}
            <div className="max-w-4xl mx-auto">
              <Card className="p-8 lg:p-12 bg-primary text-primary-foreground shadow-xl border-none">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl lg:text-6xl text-accent leading-none">"</div>
                    <div className="flex-1 space-y-4">
                      <p className="text-lg lg:text-xl leading-relaxed">
                        Grading wait times? A thing of the past! I used to stress for days waiting for results.
                        Now I submit my exam and instantly see where I excelled and what to review. It&apos;s transformed how I study.
                      </p>
                      <div className="flex items-center gap-4 pt-4 border-t border-primary-foreground/20">
                        <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent-foreground">
                          AS
                        </div>
                        <div>
                          <div className="font-semibold">Anonymous Student</div>
                          <div className="text-sm text-primary-foreground/80">XYZ University, Computer Science</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20 lg:py-32 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 animate-fade-in">
              <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/20">
                Why ExamHub?
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                Why Institutions Trust ExamHub
              </h2>
              <p className="text-lg text-muted-foreground">
                More than just exam software—it&apos;s a complete assessment ecosystem built for modern education.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  className="p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group border-2 border-border hover:border-primary animate-fade-in"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="space-y-6">
                    {/* Icon & Stat */}
                    <div className="flex items-start justify-between">
                      <div className="inline-flex p-4 rounded-2xl bg-primary/10 text-primary group-hover:bg-gradient-hero group-hover:text-primary-foreground transition-all group-hover:scale-110">
                        <benefit.icon className="h-8 w-8" />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl lg:text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                          {benefit.stat}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          {benefit.title}
                        </div>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>

                    {/* Details List */}
                    <ul className="space-y-2 pt-4 border-t border-border">
                      {benefit.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "ISO 27001", sublabel: "Certified" },
                { label: "SOC 2", sublabel: "Type II" },
                { label: "GDPR", sublabel: "Compliant" },
                { label: "99.9%", sublabel: "Uptime SLA" }
              ].map((badge, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl bg-muted/50 border border-border hover:border-primary transition-colors animate-fade-in"
                  style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                >
                  <div className="text-xl font-bold text-primary">{badge.label}</div>
                  <div className="text-sm text-muted-foreground">{badge.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

    </div>
  );
};

export default Index;
