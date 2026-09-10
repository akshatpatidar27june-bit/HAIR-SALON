import './globals.css';
import {BrandExperience,BrandLogo} from '../components/BrandExperience';

export const metadata={title:'Lucky Hair Salon | Since 1994',description:'Lucky Hair Salon operations system'};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>
    <BrandExperience/>
    <div className="pointer-events-none fixed left-3 top-3 z-[80] select-none sm:left-4 sm:top-4"><BrandLogo/></div>
    {children}
  </body></html>
}
