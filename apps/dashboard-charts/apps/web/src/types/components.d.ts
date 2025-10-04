declare module '@components/*' {
  import React from 'react';
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module './components/*' {
  import React from 'react';
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module '../components/*' {
  import React from 'react';
  const Component: React.ComponentType<any>;
  export default Component;
}
