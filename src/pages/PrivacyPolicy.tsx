
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold gradient-text">Privacy Policy</h1>
      </div>

      <div className="prose prose-invert max-w-none">
        <p className="text-sm text-muted-foreground mb-6">Last updated: May 30, 2024</p>

        <h2>Introduction</h2>
        <p>
          Aprajit Sarkar ("we", "us", or "our") operates the eBook Library mobile application 
          (the "Service"). This page informs you of our policies regarding the collection, use, 
          and disclosure of personal data when you use our Service and the choices you have associated 
          with that data.
        </p>

        <h2>Information Collection and Use</h2>
        <p>
          We collect several different types of information for various purposes to provide and 
          improve our Service to you.
        </p>

        <h3>Types of Data Collected</h3>
        <h4>Personal Data</h4>
        <p>
          While using our Service, we may ask you to provide us with certain personally identifiable 
          information that can be used to contact or identify you ("Personal Data"). Personally 
          identifiable information may include, but is not limited to:
        </p>
        <ul>
          <li>Device information (model, operating system version)</li>
          <li>Usage data (app features used, time spent)</li>
          <li>Crash reports</li>
        </ul>

        <h4>Usage Data</h4>
        <p>
          We may also collect information that your browser sends whenever you visit our Service or 
          when you access the Service by or through a mobile device ("Usage Data").
        </p>

        <h2>Use of Data</h2>
        <p>eBook Library uses the collected data for various purposes:</p>
        <ul>
          <li>To provide and maintain the Service</li>
          <li>To notify you about changes to our Service</li>
          <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
          <li>To provide customer care and support</li>
          <li>To provide analysis or valuable information so that we can improve the Service</li>
          <li>To monitor the usage of the Service</li>
          <li>To detect, prevent and address technical issues</li>
        </ul>

        <h2>Third-Party Services</h2>
        <p>
          Our app uses the Project Gutendex API (a Project Gutenberg API implementation) to access 
          public domain books. We also use the PoetryDB API to access public domain poems. These services 
          may collect information sent by your device as part of the API requests.
        </p>
        
        <h3>AdMob</h3>
        <p>
          We use Google AdMob to serve advertisements within our application. AdMob may collect and use 
          data for personalized advertising. For more information on how Google uses your data, visit:
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
            https://policies.google.com/technologies/partner-sites
          </a>
        </p>

        <h2>Security of Data</h2>
        <p>
          The security of your data is important to us, but remember that no method of transmission over 
          the Internet, or method of electronic storage is 100% secure. While we strive to use commercially 
          acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
        </p>

        <h2>Your Data Rights</h2>
        <p>
          You have the right to:
        </p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate personal data</li>
          <li>Request deletion of your personal data</li>
          <li>Object to our processing of your personal data</li>
          <li>Request restriction of processing your personal data</li>
          <li>Request transfer of your personal data</li>
        </ul>

        <h2>Children's Privacy</h2>
        <p>
          Our Service does not address anyone under the age of 13. We do not knowingly collect personally 
          identifiable information from anyone under the age of 13. If you are a parent or guardian and you 
          are aware that your child has provided us with Personal Data, please contact us.
        </p>

        <h2>Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
          the new Privacy Policy on this page.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us:
        </p>
        <ul>
          <li>By email: Cozmoim@gmail.com</li>
        </ul>

        <h2>API Credits</h2>
        <p>This app uses the following APIs:</p>
        <ul>
          <li>
            <strong>Gutendex API</strong>: An API providing access to the Project Gutenberg collection 
            of public domain books. <a href="https://gutendex.com/" target="_blank" rel="noopener noreferrer">
              https://gutendex.com/
            </a>
          </li>
          <li>
            <strong>PoetryDB API</strong>: An API providing access to a collection of public domain poetry.
            <a href="https://poetrydb.org/" target="_blank" rel="noopener noreferrer">
              https://poetrydb.org/
            </a>
          </li>
        </ul>
      </div>

      <div className="text-center text-sm text-muted-foreground mt-10 mb-6">
        <p>eBook Library © 2024 Aprajit Sarkar. All rights reserved.</p>
        <p>Play Store account: SynthAlz</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
