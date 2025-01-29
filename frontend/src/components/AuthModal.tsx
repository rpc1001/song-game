import { useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import supabase from '../utils/supabaseClient';

import {UserPlus} from "lucide-react";


export default function AuthModal() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <button
        onClick={() => setVisible(false)} // disable for now
      >
            <UserPlus size={24} strokeWidth={2} />
      </button>

      {visible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-zinc-800 p-6 rounded-lg shadow-lg w-96">
            <button
              onClick={() => setVisible(false)}
              className="relative  text-gray-500"
            >
              ✖
            </button>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={['google']}
              theme="dark"
              view="sign_up"
              
            />
          </div>
        </div>
      )}
    </>
  );
}
