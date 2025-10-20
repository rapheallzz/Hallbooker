const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg text-gray-800">Support</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Safety information
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Cancellation options
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">Community</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Airbnb.org: disaster relief housing
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Support Afghan refugees
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Combating discrimination
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">Hosting</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Try hosting
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  AirCover: protection for Hosts
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Explore hosting resources
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">About</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Newsroom
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Learn about new features
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Careers
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 flex justify-between items-center">
          <p className="text-gray-600">
            &copy; {new Date().getFullYear()} HallBooker, Inc.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Privacy
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Terms
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
