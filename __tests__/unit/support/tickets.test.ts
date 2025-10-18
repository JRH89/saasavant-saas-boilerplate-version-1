import { mockFirestore, resetMockData, addMockData, getMockData } from '../../mocks/firebase'
import { mockUser, mockSupportTicket } from '../../utils/test-utils'

describe('Support Tickets', () => {
  beforeEach(() => {
    resetMockData()
  })

  describe('Create Support Ticket', () => {
    it('should create a new support ticket', async () => {
      const ticketData = {
        userId: mockUser.uid,
        type: 'Bug',
        message: 'Found a bug in the dashboard',
        timestamp: Date.now(),
        ticketStatus: 'submitted',
      }

      const ticketsCollection = mockFirestore.collection('supportTickets')
      const result = await ticketsCollection.add(ticketData)

      expect(result).toHaveProperty('id')
      
      const savedTicket = getMockData('supportTickets', result.id)
      expect(savedTicket.userId).toBe(mockUser.uid)
      expect(savedTicket.type).toBe('Bug')
      expect(savedTicket.ticketStatus).toBe('submitted')
    })

    it('should create ticket with all required fields', async () => {
      const ticketData = {
        userId: mockUser.uid,
        type: 'Feature Request',
        message: 'Please add dark mode',
        timestamp: Date.now(),
        ticketStatus: 'submitted',
      }

      const ticketsCollection = mockFirestore.collection('supportTickets')
      const result = await ticketsCollection.add(ticketData)

      const savedTicket = getMockData('supportTickets', result.id)
      expect(savedTicket).toHaveProperty('userId')
      expect(savedTicket).toHaveProperty('type')
      expect(savedTicket).toHaveProperty('message')
      expect(savedTicket).toHaveProperty('timestamp')
      expect(savedTicket).toHaveProperty('ticketStatus')
    })

    it('should support different ticket types', async () => {
      const ticketTypes = ['Bug', 'Feature Request', 'Help']
      const ticketsCollection = mockFirestore.collection('supportTickets')

      for (const type of ticketTypes) {
        const result = await ticketsCollection.add({
          userId: mockUser.uid,
          type,
          message: `Test ${type} ticket`,
          timestamp: Date.now(),
          ticketStatus: 'submitted',
        })

        const savedTicket = getMockData('supportTickets', result.id)
        expect(savedTicket.type).toBe(type)
      }
    })
  })

  describe('Retrieve Support Tickets', () => {
    it('should retrieve all tickets for a user', async () => {
      // Add multiple tickets
      addMockData('supportTickets', 'ticket1', {
        userId: mockUser.uid,
        type: 'Bug',
        message: 'Bug ticket',
        timestamp: Date.now(),
        ticketStatus: 'submitted',
      })

      addMockData('supportTickets', 'ticket2', {
        userId: mockUser.uid,
        type: 'Help',
        message: 'Help ticket',
        timestamp: Date.now(),
        ticketStatus: 'submitted',
      })

      const ticketsCollection = mockFirestore.collection('supportTickets')
      const querySnapshot = await ticketsCollection
        .where('userId', '==', mockUser.uid)
        .get()

      expect(querySnapshot.docs.length).toBeGreaterThanOrEqual(2)
    })

    it('should retrieve a specific ticket by ID', async () => {
      addMockData('supportTickets', 'ticket123', mockSupportTicket)

      const ticketDoc = mockFirestore.doc('supportTickets/ticket123')
      const snapshot = await ticketDoc.get()

      expect(snapshot.exists()).toBe(true)
      expect(snapshot.data().message).toBe(mockSupportTicket.message)
    })
  })

  describe('Update Support Ticket', () => {
    it('should update ticket status', async () => {
      addMockData('supportTickets', 'ticket123', mockSupportTicket)

      const ticketDoc = mockFirestore.doc('supportTickets/ticket123')
      await ticketDoc.update({ ticketStatus: 'in_progress' })

      const updatedTicket = getMockData('supportTickets', 'ticket123')
      expect(updatedTicket.ticketStatus).toBe('in_progress')
    })

    it('should update ticket with admin response', async () => {
      addMockData('supportTickets', 'ticket123', mockSupportTicket)

      const ticketDoc = mockFirestore.doc('supportTickets/ticket123')
      await ticketDoc.update({
        ticketStatus: 'resolved',
        adminResponse: 'Issue has been fixed',
        resolvedAt: Date.now(),
      })

      const updatedTicket = getMockData('supportTickets', 'ticket123')
      expect(updatedTicket.ticketStatus).toBe('resolved')
      expect(updatedTicket.adminResponse).toBe('Issue has been fixed')
      expect(updatedTicket).toHaveProperty('resolvedAt')
    })

    it('should track ticket status transitions', async () => {
      addMockData('supportTickets', 'ticket123', mockSupportTicket)

      const ticketDoc = mockFirestore.doc('supportTickets/ticket123')
      const statuses = ['submitted', 'in_progress', 'resolved']

      for (const status of statuses) {
        await ticketDoc.update({ ticketStatus: status })
        const ticket = getMockData('supportTickets', 'ticket123')
        expect(ticket.ticketStatus).toBe(status)
      }
    })
  })

  describe('Delete Support Ticket', () => {
    it('should delete a support ticket', async () => {
      addMockData('supportTickets', 'ticket123', mockSupportTicket)

      const ticketDoc = mockFirestore.doc('supportTickets/ticket123')
      await ticketDoc.delete()

      const deletedTicket = getMockData('supportTickets', 'ticket123')
      expect(deletedTicket).toBeUndefined()
    })

    it('should verify ticket is deleted', async () => {
      addMockData('supportTickets', 'ticket123', mockSupportTicket)

      const ticketDoc = mockFirestore.doc('supportTickets/ticket123')
      await ticketDoc.delete()

      const snapshot = await ticketDoc.get()
      expect(snapshot.exists()).toBe(false)
    })
  })

  describe('Ticket Validation', () => {
    it('should validate ticket message is not empty', () => {
      const isValidMessage = (message: string) => message.trim().length > 0
      
      expect(isValidMessage('Valid message')).toBe(true)
      expect(isValidMessage('')).toBe(false)
      expect(isValidMessage('   ')).toBe(false)
    })

    it('should validate ticket type is valid', () => {
      const validTypes = ['Bug', 'Feature Request', 'Help']
      const isValidType = (type: string) => validTypes.includes(type)
      
      expect(isValidType('Bug')).toBe(true)
      expect(isValidType('Feature Request')).toBe(true)
      expect(isValidType('Help')).toBe(true)
      expect(isValidType('Invalid')).toBe(false)
    })
  })

  describe('Admin Ticket Management', () => {
    it('should retrieve all tickets for admin', async () => {
      addMockData('supportTickets', 'ticket1', {
        userId: 'user1',
        type: 'Bug',
        message: 'Bug 1',
        timestamp: Date.now(),
        ticketStatus: 'submitted',
      })

      addMockData('supportTickets', 'ticket2', {
        userId: 'user2',
        type: 'Help',
        message: 'Help 1',
        timestamp: Date.now(),
        ticketStatus: 'submitted',
      })

      const ticketsCollection = mockFirestore.collection('supportTickets')
      const querySnapshot = await ticketsCollection.get()

      expect(querySnapshot.docs.length).toBeGreaterThanOrEqual(2)
    })

    it('should filter tickets by status', async () => {
      addMockData('supportTickets', 'ticket1', {
        ...mockSupportTicket,
        ticketStatus: 'submitted',
      })

      addMockData('supportTickets', 'ticket2', {
        ...mockSupportTicket,
        ticketStatus: 'resolved',
      })

      const allTickets = getMockData('supportTickets')
      const submittedTickets = Object.values(allTickets).filter(
        (ticket: any) => ticket.ticketStatus === 'submitted'
      )

      expect(submittedTickets.length).toBeGreaterThanOrEqual(1)
    })
  })
})
