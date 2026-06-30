function uploadedPeopleFileUrl(file) {
  if (!file?.filename) {
    return '';
  }

  return `/uploads/people/${file.filename}`;
}

export function uploadPeopleImage(req, res, _next, { kind } = {}) {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required.' });
  }

  const url = uploadedPeopleFileUrl(req.file);
  return res.status(201).json({ url, kind: String(kind || '') });
}
