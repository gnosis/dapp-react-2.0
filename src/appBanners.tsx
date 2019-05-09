/* 
 * App Banners
 *
 * Use this page to add banners to the top of the app page
 * Order matters! See example
 */

import React from 'react'

export const ExampleAppBanners = [
  // Index 0 (below) will be highest
  {
    content: `ENV: ${process.env.FE_CONDITIONAL_ENV}`,
    customStyle: {
      backgroundColor: '#ffbdbd'
    },
    key: Math.random(),
  },
  {
    content: () => <p>Damn son, where'd you find this. And this link: <a href="https://google.com" target="_blank">wussup</a></p>,
    customStyle: {
      background: '#ffe1b5',
    },
    key: Math.random(),
  },
]
