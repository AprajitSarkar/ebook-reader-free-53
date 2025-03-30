
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TermsConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold gradient-text">Terms & Conditions</h1>
      </div>

      <div className="prose prose-invert max-w-none">
        <p className="text-sm text-muted-foreground mb-6">Last updated: May 30, 2024</p>

        <p>
          Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using 
          the eBook Library mobile application (the "Service") operated by Aprajit Sarkar ("us", "we", or "our").
        </p>

        <p>
          Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. 
          These Terms apply to all visitors, users, and others who access or use the Service.
        </p>

        <p>
          By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part 
          of the terms, then you may not access the Service.
        </p>

        <h2>Content</h2>
        <p>
          Our Service allows you to access public domain books and poetry provided through third-party APIs. 
          All content accessed through our Service is subject to the copyright and licensing terms of the 
          respective content providers.
        </p>

        <p>
          Books accessed through the Gutendex API (Project Gutenberg) are in the public domain in the United 
          States. If you're not located in the United States, you must check the copyright laws of your country 
          before using this content.
        </p>

        <h2>Fair Use</h2>
        <p>
          The content provided through our Service is intended for personal, non-commercial use. You may not 
          use the content for any commercial purpose without appropriate permission from the copyright holders.
        </p>

        <h2>Accounts</h2>
        <p>
          When you create an account with us, you must provide information that is accurate, complete, and current 
          at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination 
          of your account on our Service.
        </p>

        <h2>Intellectual Property</h2>
        <p>
          The Service and its original content (excluding content provided through third-party APIs), features, 
          and functionality are and will remain the exclusive property of Aprajit Sarkar and its licensors.
        </p>

        <h2>Links To Other Web Sites</h2>
        <p>
          Our Service may contain links to third-party web sites or services that are not owned or controlled by us.
        </p>

        <p>
          We have no control over, and assume no responsibility for, the content, privacy policies, or practices 
          of any third-party web sites or services. You further acknowledge and agree that we shall not be responsible 
          or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection 
          with the use of or reliance on any such content, goods, or services available on or through any such web sites 
          or services.
        </p>

        <h2>Termination</h2>
        <p>
          We may terminate or suspend your account immediately, without prior notice or liability, for any reason 
          whatsoever, including without limitation if you breach the Terms.
        </p>

        <p>
          Upon termination, your right to use the Service will immediately cease. If you wish to terminate your 
          account, you may simply discontinue using the Service.
        </p>

        <h2>Limitation Of Liability</h2>
        <p>
          In no event shall Aprajit Sarkar, nor its directors, employees, partners, agents, suppliers, or affiliates, 
          be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, 
          loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or 
          inability to access or use the Service.
        </p>

        <h2>Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the laws of India, without regard to its 
          conflict of law provisions.
        </p>

        <p>
          Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. 
          If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions 
          of these Terms will remain in effect.
        </p>

        <h2>Changes</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is 
          material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes 
          a material change will be determined at our sole discretion.
        </p>

        <p>
          By continuing to access or use our Service after those revisions become effective, you agree to be bound by the 
          revised terms. If you do not agree to the new terms, please stop using the Service.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us:
        </p>
        <ul>
          <li>By email: Cozmoim@gmail.com</li>
        </ul>
      </div>

      <div className="text-center text-sm text-muted-foreground mt-10 mb-6">
        <p>eBook Library © 2024 Aprajit Sarkar. All rights reserved.</p>
      </div>
    </div>
  );
};

export default TermsConditions;
