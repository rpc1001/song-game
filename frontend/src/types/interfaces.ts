export interface albumObject {
    id: number;
    title: string;
    cover_big: string;
    tracklist: string;
  }
  
  export interface artistObject {
    id: number;
    name: string;
    picture_big: string;
  }
  
  export interface songObject {
    id: number; 
    title: string;
    artist: artistObject;
    album: albumObject;
    preview: string;
    contributors: { name: string; role: string }[];
  }
  