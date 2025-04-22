export const searchGoogleBooks = async (query: string) => {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${query}`
  );
  return response;
};
