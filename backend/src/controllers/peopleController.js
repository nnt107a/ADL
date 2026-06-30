import { isValidObjectId } from 'mongoose';
import Person from '../models/Person.js';

function normalizeExpertise(value) {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) =>
        String(item)
          .split(',')
          .map((part) => part.trim())
      )
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export async function listPeople(_req, res, next) {
  try {
    const people = await Person.find().sort({ featured: -1, order: 1, name: 1 });
    res.json(people);
  } catch (error) {
    next(error);
  }
}

export async function getPersonById(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid person id.' });
    }

    const person = await Person.findById(id);

    if (!person) {
      return res.status(404).json({ message: 'Person not found.' });
    }

    res.json(person);
  } catch (error) {
    next(error);
  }
}

export async function createPerson(req, res, next) {
  try {
    const payload = {
      ...req.body,
      expertise: normalizeExpertise(req.body?.expertise),
    };

    const person = await Person.create(payload);
    res.status(201).json(person);
  } catch (error) {
    next(error);
  }
}

export async function updatePerson(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid person id.' });
    }

    const payload = {
      ...req.body,
      expertise: normalizeExpertise(req.body?.expertise),
    };

    const person = await Person.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!person) {
      return res.status(404).json({ message: 'Person not found.' });
    }

    res.json(person);
  } catch (error) {
    next(error);
  }
}

export async function deletePerson(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid person id.' });
    }

    const person = await Person.findByIdAndDelete(id);

    if (!person) {
      return res.status(404).json({ message: 'Person not found.' });
    }

    res.json({ message: 'Person deleted successfully.' });
  } catch (error) {
    next(error);
  }
}
