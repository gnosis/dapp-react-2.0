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
    content: () => <p>Damn son, where'd you find this. And <a href="https://google.com" target="_blank">what the fuck is this</a></p>,
    customStyle: {
      background: '#b5ffb5',
    },
    key: Math.random(),
  },
  {
    content: 'Yoooo this is crazy',
    customStyle: {
      background: '#ffbdff',
    },
    key: Math.random(),
  },
]
