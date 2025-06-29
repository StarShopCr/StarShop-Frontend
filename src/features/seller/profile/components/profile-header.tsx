import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Edit, MapPin, Globe, Mail } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

const ProfileHeader = () => {
  return (
    <div>
      <Card className=" bg-[#0F0E1D] shadow-[0_0_8px_rgba(255,255,255,0.1)] border-slate-700">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1">
              <div className="relative">
                <div className="w-24 h-24 md:w-28 md:h-28 bg-slate-600 rounded-full flex items-center justify-center">
                  <Image
                    src="/placeholder.svg?height=96&width=96"
                    alt="Store Logo"
                    width={96}
                    height={96}
                    className="rounded-full"
                  />
                </div>
              </div>

              <div className="flex-1 space-y-3.5">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  STRAB
                </h1>
                <p className="text-lg text-purple-400">
                  Premium Fashion Destination
                </p>
                <p className="text-gray-400 max-w-2xl">
                  A curated collection of urban streetwear and contemporary
                  fashion pieces for the style-conscious individual.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full lg:w-auto">
              <Button className="bg-purple-500/10 text-purple-400 border-purple-500/50 hover:bg-purple-500/20">
                <Edit className="w-4 h-4 mr-2" />
                Edit Store
              </Button>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span>Costa Rica</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Globe className="w-4 h-4" />
                  <span>strab.com</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span>contact@strab.com</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileHeader;
