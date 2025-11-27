import { useState, useCallback } from 'react';
import { eventsAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const useEvents = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const user = useAuthStore((state) => state.user);

  // Fetch events by location
  const fetchEventsByLocation = useCallback(async (location) => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventsAPI.getByLocation(location);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch events';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch joined events
  const fetchJoinedEvents = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventsAPI.getByLocation(userId);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch joined events';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Like event
  const likeEvent = useCallback(async (eventId) => {
    try {
      setError(null);
      const response = await eventsAPI.like(eventId, user._id);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to like event';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Unlike event
  const unlikeEvent = useCallback(async (eventId) => {
    try {
      setError(null);
      const response = await eventsAPI.unlike(eventId, user._id);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to unlike event';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Join event
  const joinEvent = useCallback(async (eventId) => {
    try {
      setError(null);
      const response = await eventsAPI.join(user._id, eventId);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to join event';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Unjoin event
  const unjoinEvent = useCallback(async (eventId) => {
    try {
      setError(null);
      const response = await eventsAPI.unjoin(user._id, eventId);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to unjoin event';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Add comment
  const addComment = useCallback(async (eventId, text) => {
    try {
      setError(null);
      const response = await eventsAPI.comment(eventId, user._id, text);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add comment';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Create event
  const createEvent = useCallback(async (eventData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventsAPI.create(eventData);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create event';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update event
  const updateEvent = useCallback(async (eventId, eventData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventsAPI.update(eventId, eventData);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update event';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete event
  const deleteEvent = useCallback(async (eventId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventsAPI.delete(eventId);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete event';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchEventsByLocation,
    fetchJoinedEvents,
    likeEvent,
    unlikeEvent,
    joinEvent,
    unjoinEvent,
    addComment,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};

export default useEvents;
