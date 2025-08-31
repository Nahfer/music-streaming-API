import * as z from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().regex(/^[A-Za-z\s]+$/, "Only A-Z, a-z characters allowed"),
  gender: z.enum(["MALE", "FEMALE", "UNDEFINED"]).optional(),
  type: z.enum(["ARTIST", "LISTENER"]).optional(),
  bio: z.string().optional(),
  profileImageUrl: z.string().url("Invalid URL").optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const playlistSchema = z.object({
  playlistTitle: z.string().min(1, "Playlist title cannot be empty"),
  tracks: z.array(z.string().cuid()).nonempty("Playlist must have at least one track"),
});

export const trackSchema = z.object({
  title: z.string().min(1, "Track title cannot be empty"),
  r_aid: z.string().cuid(), // Artist ID
  duration: z.number().int().positive("Duration must be positive"),
  genreid: z.string().cuid(),
  albumid: z.string().cuid(),
  lyrics: z.string().optional(),
  hostedDirectoryUrl: z.string().url("Invalid URL"),
});

export const albumSchema = z.object({
  title: z.string().min(1, "Album title cannot be empty"),
  albumCover: z.string().url("Invalid URL").optional(),
  artistid: z.string().cuid(),
});

export const genreSchema = z.object({
  genre: z.enum(["UNDEFINED", "HIPHOP", "POP", "CLASSICAL"]).optional(),
  genreCoverUrl: z.string().url("Invalid URL").optional(),
});
