import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Disclaimer — Deutsch B2 Classroom",
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-brand-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-700 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-2xl font-bold text-brand-950 mb-2">Disclaimer</h1>
        <p className="text-sm text-brand-400 mb-8">Last updated: April 2026</p>

        <div className="bg-white rounded-2xl border border-brand-100 p-8 space-y-6 text-sm text-brand-700 leading-relaxed">

          <section>
            <h2 className="font-semibold text-brand-950 mb-2">AI-Generated Content</h2>
            <p>
              All content on this site — including vocabulary, grammar notes, and explanations — is
              automatically generated from user-uploaded images using artificial intelligence. It is
              provided strictly for personal educational reference. No warranty of any kind, express or
              implied, is given regarding its accuracy, completeness, or fitness for any purpose.
              AI-generated content may contain errors and must not be relied upon as authoritative.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-950 mb-2">User Responsibility</h2>
            <p>
              Users bear sole and full responsibility for any images or materials they upload to this
              site. By uploading content, you confirm that you hold all necessary rights to do so and
              that the content does not violate any applicable law, third-party copyright, privacy
              right, or any other regulation. The site, its operators, and contributors accept no
              responsibility for user-uploaded materials.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-950 mb-2">Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, the site, its operators, and
              contributors shall not be liable for any direct, indirect, incidental, consequential, or
              punitive damages arising from your use of this site, reliance on AI-generated content, or
              the upload, processing, or display of any materials.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-950 mb-2">No Professional Advice</h2>
            <p>
              Nothing on this site constitutes professional linguistic, legal, or academic advice.
              Always verify language rules and translations through authoritative sources before
              relying on them for formal or professional purposes.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-950 mb-2">Privacy & Images of People</h2>
            <p>
              Uploaded images may contain the likeness, face, or personal data of real individuals.
              By uploading any image that depicts a person, you confirm that you have obtained the
              explicit consent of each identifiable individual for their image to be uploaded,
              processed by AI, and displayed on this site. You must not upload images of people
              without their knowledge or consent. This site complies with no obligation to verify
              consent on your behalf — that responsibility rests solely with the uploader. If you
              are in the European Union or European Economic Area, you acknowledge your obligations
              under the General Data Protection Regulation (GDPR).
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-950 mb-2">Third-Party AI Processing</h2>
            <p>
              Images uploaded to this site are transmitted to third-party artificial intelligence
              services (including Groq, Inc.) for processing. By uploading content, you acknowledge
              and consent to your data being processed by these external services, which are governed
              by their own privacy policies and data retention practices. This site does not control
              and is not responsible for how third-party providers handle your data after transmission.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-950 mb-2">No Guarantee of Anonymisation</h2>
            <p>
              This site includes an automated face-detection and blurring feature as a best-effort
              measure. However, this process is AI-based and not infallible. The site does not
              guarantee the complete anonymisation, removal, or obscuring of any biometric data,
              faces, or personally identifiable information present in uploaded images. Users must
              not rely on this feature as a substitute for obtaining proper consent.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-950 mb-2">Data Storage & Retention</h2>
            <p>
              This site does not operate its own data infrastructure. Uploaded images and
              generated content are stored on third-party cloud services (including Supabase).
              The site operator does not actively manage, archive, or apply a defined data
              retention policy. Data may persist on third-party infrastructure indefinitely
              until manually deleted. If you wish to have your uploaded content removed, please
              contact the site administrator directly. For details on how third-party providers
              store and handle your data, refer to their respective privacy policies.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-950 mb-2">Governing Law</h2>
            <p>
              These terms are governed by and construed in accordance with applicable law. Any
              disputes arising from the use of this site shall be subject to the exclusive
              jurisdiction of the competent courts of the country in which the site operator is
              based. If any provision of this disclaimer is found to be unenforceable, the remaining
              provisions shall continue in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-950 mb-2">Changes to This Disclaimer</h2>
            <p>
              This disclaimer may be updated at any time without prior notice. Continued use of the
              site following any changes constitutes your acceptance of the revised terms. It is your
              responsibility to review this page periodically.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
