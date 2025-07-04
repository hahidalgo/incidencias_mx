import { redirect } from 'next/navigation';

/**
 * The main page component that redirects to /login.
 *
 * @returns {JSX.Element} The rendered HomePage component.
 */
const Page = () => {
    redirect('/login');
};

export default Page;
