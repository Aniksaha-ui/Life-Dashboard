import {
  ArrowRight,
  ExternalLink,
  Github,
  Globe,
  Code2,
  Link2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { clsx } from "clsx";
import { CopyButton } from "../../components/CopyButton";

const AndroidIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 1024 1024" className={className} fill="currentColor">
    <path d="M270.1 741.7c0 23.4 19.1 42.5 42.6 42.5h48.7v120.4c0 30.5 24.5 55.4 54.6 55.4 30.2 0 54.6-24.8 54.6-55.4V784.1h85v120.4c0 30.5 24.5 55.4 54.6 55.4 30.2 0 54.6-24.8 54.6-55.4V784.1h48.7c23.5 0 42.6-19.1 42.6-42.5V346.4h-486v395.3zm357.1-600.1l44.9-65c2.6-3.8 2-8.9-1.5-11.4-3.5-2.4-8.5-1.2-11.1 2.6l-46.6 67.6c-30.7-12.1-64.9-18.8-100.8-18.8-35.9 0-70.1 6.7-100.8 18.8l-46.6-67.5c-2.6-3.8-7.6-5.1-11.1-2.6-3.5 2.4-4.1 7.4-1.5 11.4l44.9 65c-71.4 33.2-121.4 96.1-127.8 169.6h486c-6.6-73.6-56.7-136.5-128-169.7zM409.5 244.1a26.9 26.9 0 1 1 26.9-26.9 26.97 26.97 0 0 1-26.9 26.9zm208.4 0a26.9 26.9 0 1 1 26.9-26.9 26.97 26.97 0 0 1-26.9 26.9zm223.4 100.7c-30.2 0-54.6 24.8-54.6 55.4v216.4c0 30.5 24.5 55.4 54.6 55.4 30.2 0 54.6-24.8 54.6-55.4V400.1c.1-30.6-24.3-55.3-54.6-55.3zm-658.6 0c-30.2 0-54.6 24.8-54.6 55.4v216.4c0 30.5 24.5 55.4 54.6 55.4 30.2 0 54.6-24.8 54.6-55.4V400.1c0-30.6-24.5-55.3-54.6-55.3z" />
  </svg>
);

const AppleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
  </svg>
);

export default function DevelopersPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Developer</h1>
            <nav className="flex items-center gap-2 mt-1.5 text-xs font-medium text-slate-500">
              <Link
                to="/dashboard"
                className="hover:text-primary-600 transition-colors"
              >
                Home
              </Link>
              <ArrowRight className="w-3 h-3" />
              <span className="text-slate-900">Developer</span>
            </nav>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
            SSLCOMMERZ is the first payment gateway in Bangladesh opening doors
            for merchants to receive payments on the internet via their online
            stores. Customers are able to buy products online using their credit
            cards as well as bank accounts. If you are a merchant, you have come
            to the right place! Enhance your business by integrating SSLCOMMERZ
            to your online store and facilitating online payment in Bangladeshi
            Taka. Your customers will be able to pay for your products using
            local credit/debit cards like VISA, MasterCard, DBBL Nexus Card and
            any kind of credit card or bank accounts right from your online
            store.
          </p>
          <p className="text-sm text-slate-600">
            SSLCOMMERZ uses industry standard Secure Sockets Layer (SSL)
            technology which is used worldwide for securing data encryption
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate-700">
              Developer Page :
            </span>
            <a
              href="https://developer.sslcommerz.com/"
              target="_blank"
              rel="noreferrer"
              className="text-primary-600 hover:underline flex items-center gap-1 font-medium"
            >
              https://developer.sslcommerz.com/{" "}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* SDK and Module Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 px-1">
          SDK and Module
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Android SDK */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <AndroidIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800">Android SDK</h3>
            </div>

            <div className="space-y-6">
              {/* AndroidX */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900">
                  AndroidX SDK
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Lib :</span>
                    <button className="text-primary-600 hover:underline font-bold">
                      Click here
                    </button>
                    <span className="text-slate-400">to download</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Document :</span>
                    <button className="text-primary-600 hover:underline font-bold">
                      Click here
                    </button>
                    <span className="text-slate-400">to download</span>
                  </div>
                  <p className="text-slate-500 font-medium mt-1">
                    Released on 13/10/2020
                  </p>
                </div>
              </div>

              {/* Legacy Android */}
              <div className="space-y-3 pt-4 border-t border-slate-50">
                <h4 className="text-sm font-bold text-slate-900 uppercase">
                  Android SDK
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Lib :</span>
                    <button className="text-primary-600 hover:underline font-bold">
                      Click here
                    </button>
                    <span className="text-slate-400">to download</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Document :</span>
                    <button className="text-primary-600 hover:underline font-bold">
                      Click here
                    </button>
                    <span className="text-slate-400">to download</span>
                  </div>
                  <div className="mt-4 space-y-1.5 pt-2">
                    <p className="text-slate-900 font-bold">
                      Last Update on 26/July/2020
                    </p>
                    <p className="text-slate-400">
                      (Final version before AndroidX)
                    </p>
                    <div className="flex flex-col gap-1 mt-2 text-slate-500 font-medium">
                      <span>Previous Update on 22/April/2020</span>
                      <span>Previous Update on 22/Oct/2019</span>
                      <span>Previous Update on 4/Sep/2019</span>
                      <span>Previous Update on 20/Aug/2019</span>
                      <span>Previous Update on 11/July/2019</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* iOS SDK */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <AppleIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800">iOS SDK</h3>
            </div>
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Lib :</span>
                <button className="text-primary-600 hover:underline font-bold">
                  Click here
                </button>
                <span className="text-slate-400">to download</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Document :</span>
                <button className="text-primary-600 hover:underline font-bold">
                  Click here
                </button>
                <span className="text-slate-400">to download</span>
              </div>
              <div className="mt-6 space-y-1.5 pt-2">
                <p className="text-slate-900 font-bold">
                  Last Update on 20/Sep/2022
                </p>
                <div className="flex flex-col gap-1 mt-2 text-slate-500 font-medium">
                  <span>Previous Update on 11/Nov/2021</span>
                  <span>Previous Update on 26/July/2020</span>
                  <span>Previous Update on 22/Oct/2019</span>
                  <span>Previous Update on 12/July/2019</span>
                </div>
              </div>
            </div>
          </div>

          {/* CMS Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800">CMS</h3>
            </div>
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Github Link -</span>
                <button className="text-primary-600 hover:underline font-bold flex items-center gap-1">
                  Click here <Github className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Developer Page -</span>
                <button className="text-primary-600 hover:underline font-bold">
                  Click here
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Interface Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 px-1">
          Payment Interface
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <p className="text-xs font-medium text-slate-500 mb-8">
            There are two ways to display the SSLCOMMERZ payment page for your
            customer.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs flex items-center justify-center">
                  1
                </span>
                Easy Checkout Integration
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                It is a embedded js integration within your site which will
                display the payment channels in your page.
              </p>
              <div className="aspect-[16/9] bg-slate-50 rounded-lg border border-slate-200 relative overflow-hidden group shadow-inner">
                <img
                  src="https://sslcommerz.com/wp-content/uploads/2024/03/HostedRedirection.png"
                  alt="Easy Checkout Integration"
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs flex items-center justify-center">
                  2
                </span>
                Hosted Payment Integration
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Here, you will redirect the customer to SSLCOMMERZ Hosted page
                to display the payment channels
              </p>
              <div className="aspect-[16/9] bg-slate-50 rounded-lg border border-slate-200 relative overflow-hidden group shadow-inner">
                <img
                  src="https://sslcommerz.com/wp-content/uploads/2026/02/Web.png"
                  alt="Hosted Payment Integration"
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Links Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="bg-[#3b82f6] px-6 py-3.5 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-white/90" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Integration Links
          </h3>
        </div>
        <div className="p-8 space-y-10">
          {/* Sandbox System */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h4 className="font-bold text-slate-800">Sandbox System</h4>
            </div>
            <div className="space-y-5">
              <UrlItem
                label="Gateway URL"
                url="https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
              />
              <UrlItem
                label="Validation API"
                url="https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php"
              />
              <UrlItem
                label="Example"
                url="https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=<Validation Id>&store_id=<Store Text Id>&store_passwd=<Store Test Password>"
                isExample
              />
              <UrlItem
                label="Transaction Status Check API"
                url="https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php"
              />
              <UrlItem
                label="Example"
                url="https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php?tran_id=<Transaction Id>&store_id=<Store Text Id>&store_passwd=<Store Test Password>&v=3&format=json"
                isExample
              />
            </div>
          </div>

          {/* Live System */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <h4 className="font-bold text-slate-800">Live System</h4>
            </div>
            <div className="space-y-5">
              <UrlItem
                label="Gateway URL"
                url="https://securepay.sslcommerz.com/gwprocess/v4/api.php"
              />
              <UrlItem
                label="Validation API"
                url="https://securepay.sslcommerz.com/validator/api/validationserverAPI.php"
              />
              <UrlItem
                label="Example"
                url="https://securepay.sslcommerz.com/validator/api/validationserverAPI.php?val_id=<Validation Id>&store_id=<Store Live Id>&store_passwd=<Store Live Password>"
                isExample
              />
              <UrlItem
                label="Transaction Status Check API"
                url="https://securepay.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php"
              />
              <UrlItem
                label="Example"
                url="https://securepay.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php?tran_id=<Transaction Id>&store_id=<Store Text Id>&store_passwd=<Store Test Password>&v=3&format=json"
                isExample
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pay with Logo Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-[#3b82f6] px-6 py-3.5 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-white/90" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Pay with Logo
          </h3>
        </div>
        <div className="p-8 space-y-12">
          <LogoSection
            title="Size-01"
            imagePath="https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-01.png"
            isFullWidth
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-slate-100 pb-12">
            <LogoSection
              title="Size-02"
              imagePath="https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-02.png"
              isFullWidth
            />
            <LogoSection
              title="Size-04"
              imagePath="https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-04.png"
              isFullWidth
            />
          </div>
          <LogoSection
            title="Size-03"
            imagePath="https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-03.png"
            isFullWidth
          />
          <LogoSection
            title="Size-05"
            imagePath="https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-05.png"
            isFullWidth
          />
        </div>
      </div>
    </div>
  );
}

function UrlItem({
  label,
  url,
  isExample = false,
}: {
  label: string;
  url: string;
  isExample?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label
        className={clsx(
          "text-xs font-bold text-slate-500",
          isExample ? "italic" : "",
        )}
      >
        {label}:
      </label>
      <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 group">
        <code className="text-[11px] font-mono text-slate-700 flex-1 break-all leading-relaxed whitespace-pre-wrap">
          {url}
        </code>
        <CopyButton
          value={url}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
}

function LogoSection({
  title,
  imagePath,
  isFullWidth = false,
}: {
  title: string;
  imagePath: string;
  isFullWidth?: boolean;
}) {
  const codeSnippet = `<a target="_blank" href="https://www.sslcommerz.com/" title="SSLCommerz" alt="SSLCommerz"><img style="width:300px;height:auto;" src="${imagePath}" /></a>`;

  return (
    <div
      className={clsx("space-y-6", isFullWidth ? "max-w-none" : "max-w-4xl")}
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h4 className="text-sm font-bold text-primary-600 uppercase tracking-widest">
          {title}
        </h4>
      </div>

      <div
        className={clsx(
          "grid gap-8",
          isFullWidth ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2",
        )}
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Image Path
            </h4>
            <a
              href={imagePath}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-primary-600 hover:underline break-all font-medium"
            >
              {imagePath}
            </a>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold text-slate-900">Example Code</h4>
              <CopyButton
                value={codeSnippet}
                className="text-slate-400 hover:text-primary-600 transition-colors"
              />
            </div>
            <div className="relative group">
              <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-[10px] font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto border border-white/5">
                {codeSnippet}
              </pre>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-2">Preview</h4>
          <div className="p-5 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-inner min-h-[120px] overflow-hidden">
            <img
              src={imagePath}
              alt={`Preview ${title}`}
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
