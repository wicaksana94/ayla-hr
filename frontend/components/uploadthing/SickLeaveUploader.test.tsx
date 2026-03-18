// Tests for SickLeaveUploader component

import { render, screen, fireEvent } from '@testing-library/react';
import { SickLeaveUploader } from '../uploadthing/SickLeaveUploader';

const mockStartUpload = jest.fn();

jest.mock('@uploadthing/react', () => ({
  generateReactHelpers: () => ({
    useUploadThing: () => ({
      startUpload: mockStartUpload,
      isUploading: false,
    }),
  }),
}));

describe('SickLeaveUploader', () => {
  const mockOnUploadComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render file input', () => {
    render(<SickLeaveUploader onUploadComplete={mockOnUploadComplete} />);
    
    expect(screen.getByLabelText(/Attachment/i)).toBeInTheDocument();
    expect(screen.getByText(/Accepted: Images/i)).toBeInTheDocument();
  });

  it('should reject invalid file types', () => {
    render(<SickLeaveUploader onUploadComplete={mockOnUploadComplete} />);
    
    const file = new File(['test'], 'test.exe', { type: 'application/x-executable' });
    const input = screen.getByLabelText(/Attachment/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
    expect(mockOnUploadComplete).not.toHaveBeenCalled();
    expect(mockStartUpload).not.toHaveBeenCalled();
  });

  it('should reject files larger than 4MB', () => {
    render(<SickLeaveUploader onUploadComplete={mockOnUploadComplete} />);
    
    // Create a file larger than 4MB (5MB)
    const buffer = new ArrayBuffer(5 * 1024 * 1024);
    const file = new File([buffer], 'large.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/Attachment/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(screen.getByText(/File too large/i)).toBeInTheDocument();
    expect(mockOnUploadComplete).not.toHaveBeenCalled();
  });

  it('should display uploaded file when value is provided', () => {
    const uploadedUrl = 'https://uploadthing.com/files/test.jpg';
    render(<SickLeaveUploader onUploadComplete={mockOnUploadComplete} value={uploadedUrl} />);
    
    expect(screen.getByText(/✓ File uploaded/i)).toBeInTheDocument();
    expect(screen.getByText(/Remove/i)).toBeInTheDocument();
  });

  it('should allow removing uploaded file', () => {
    const uploadedUrl = 'https://uploadthing.com/files/test.jpg';
    render(<SickLeaveUploader onUploadComplete={mockOnUploadComplete} value={uploadedUrl} />);
    
    const removeButton = screen.getByText(/Remove/i);
    fireEvent.click(removeButton);
    
    expect(mockOnUploadComplete).toHaveBeenCalledWith('');
  });

  it('should call startUpload for valid files', () => {
    render(<SickLeaveUploader onUploadComplete={mockOnUploadComplete} />);
    
    const file = new File(['test-image'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/Attachment/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    // Should attempt to upload
    expect(mockStartUpload).toHaveBeenCalled();
  });

  it('should accept PDF files', () => {
    render(<SickLeaveUploader onUploadComplete={mockOnUploadComplete} />);
    
    const file = new File(['test-pdf'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/Attachment/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(mockStartUpload).toHaveBeenCalled();
  });
});
