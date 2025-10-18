// components/shared/CsvUploadDialog.tsx
"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { useState, ChangeEvent, useEffect } from "react"
import { cn } from "@/lib/utils"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, ChevronRight, Upload, Edit3, CheckCircle, XCircle, AlertTriangle, Trash2, Download } from "lucide-react"
import { downloadCSV } from "@/lib/utils/csv-utils"

// Schema validation types
export type ValidationError = {
  row: number
  field: string
  message: string
}

export type FieldSchema = {
  name: string
  type: 'text' | 'select' | 'boolean' | 'number' | 'custom'
  required: boolean
  options?: string[] // for select type
  defaultValue?: any
  validation?: (value: any) => string | null // custom validation function
  customRenderer?: (value: any, onChange: (value: any) => void) => React.ReactNode // for custom type
}

export type CsvSchema = {
  fields: FieldSchema[]
  title?: string
  description?: string
  instructions?: {
    required?: string[]
    optional?: string[]
  }
}

export type ParsedRow = {
  [key: string]: any
  _originalIndex: number
  _isValid: boolean
  _errors: ValidationError[]
}

type CsvUploadDialogProps = {
    open?: boolean
    trigger?: React.ReactNode
    title?: string
    schema: CsvSchema
    onUpload: (rows: ParsedRow[]) => Promise<void> | void
    onOpenChange?: (open: boolean) => void
}

export function CsvUploadDialog({ 
    trigger, 
    title = "Upload CSV", 
    schema,
    onUpload, 
    open = false, 
    onOpenChange 
}: CsvUploadDialogProps) {
    const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
    const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'edit'>('upload')
    const [error, setError] = useState<string | null>(null)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [editingRow, setEditingRow] = useState<ParsedRow | null>(null)

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (!open) {
            setParsedRows([])
            setCurrentStep('upload')
            setError(null)
            setEditingIndex(null)
            setEditingRow(null)
        }
    }, [open])

    const validateField = (field: FieldSchema, value: any, rowIndex: number): ValidationError[] => {
        const errors: ValidationError[] = []
        
        // Check required fields
        if (field.required && (!value || value.toString().trim() === '')) {
            errors.push({ 
                row: rowIndex, 
                field: field.name, 
                message: `${field.name} is required` 
            })
            return errors
        }

        // Skip validation for empty optional fields
        if (!field.required && (!value || value.toString().trim() === '')) {
            return errors
        }

        // Type validation
        switch (field.type) {
            case 'custom':
                // Custom fields rely on their own validation function
                break
                
            case 'text':
                if (typeof value !== 'string') {
                    errors.push({ 
                        row: rowIndex, 
                        field: field.name, 
                        message: `${field.name} must be text` 
                    })
                }
                break
                
            case 'number':
                if (isNaN(Number(value))) {
                    errors.push({ 
                        row: rowIndex, 
                        field: field.name, 
                        message: `${field.name} must be a number` 
                    })
                }
                break
                
            case 'select':
                if (field.options && !field.options.includes(value)) {
                    errors.push({ 
                        row: rowIndex, 
                        field: field.name, 
                        message: `${field.name} must be one of: ${field.options.join(', ')}` 
                    })
                }
                break
                
            case 'boolean':
                const boolValue = value.toString().toLowerCase()
                if (!['true', 'false', '1', '0', 'yes', 'no'].includes(boolValue)) {
                    errors.push({ 
                        row: rowIndex, 
                        field: field.name, 
                        message: `${field.name} must be true/false` 
                    })
                }
                break
        }

        // Custom validation
        if (field.validation) {
            const customError = field.validation(value)
            if (customError) {
                errors.push({ 
                    row: rowIndex, 
                    field: field.name, 
                    message: customError 
                })
            }
        }

        return errors
    }

    const validateRow = (row: any, index: number): ParsedRow => {
        const errors: ValidationError[] = []
        const validatedRow: ParsedRow = {
            _originalIndex: index,
            _isValid: true,
            _errors: []
        }

        // Validate each field according to schema
        schema.fields.forEach(field => {
            const value = row[field.name] || row[field.name.toLowerCase()] || row[field.name.toUpperCase()]
            const fieldErrors = validateField(field, value, index)
            errors.push(...fieldErrors)
            
            // Set the value with proper type conversion
            switch (field.type) {
                case 'boolean':
                    validatedRow[field.name] = value !== undefined ? 
                        ['true', '1', 'yes'].includes(value.toString().toLowerCase()) : 
                        field.defaultValue ?? false
                    break
                case 'number':
                    validatedRow[field.name] = value !== undefined ? Number(value) : (field.defaultValue ?? 0)
                    break
                default:
                    validatedRow[field.name] = (value?.toString().trim()) || (field.defaultValue ?? '')
            }
        })

        validatedRow._errors = errors
        validatedRow._isValid = errors.length === 0

        return validatedRow
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                const rows = result.data as any[]
                if (rows.length === 0) {
                    setError("CSV file is empty or has no valid rows.")
                    return
                }

                const validatedRows = rows.map((row, index) => validateRow(row, index))
                setParsedRows(validatedRows)
                        setError(null)
                setCurrentStep('preview')
            },
            error: () => {
                setError("Failed to parse CSV file.")
            },
        })
    }

    const handleEditRow = (index: number) => {
        setEditingIndex(index)
        setEditingRow({ ...parsedRows[index] })
        setCurrentStep('edit')
    }

    const handleSaveEdit = () => {
        if (editingRow && editingIndex !== null) {
            const updatedRows = [...parsedRows]
            const validatedRow = validateRow(editingRow, editingIndex)
            updatedRows[editingIndex] = validatedRow
            setParsedRows(updatedRows)
            setEditingIndex(null)
            setEditingRow(null)
            setCurrentStep('preview')
        }
    }

    const handleCancelEdit = () => {
        setEditingIndex(null)
        setEditingRow(null)
        setCurrentStep('preview')
    }

    const handleDeleteRow = (index: number) => {
        const updatedRows = parsedRows.filter((_, i) => i !== index)
        setParsedRows(updatedRows)
    }

    const handleUpload = async () => {
        const validRows = parsedRows.filter(row => row._isValid)
        if (validRows.length === 0) {
            setError("No valid rows to upload.")
            return
        }
        
        // Clean the data by removing validation metadata
        const cleanData = validRows.map(row => {
            const cleanRow: any = {}
            schema.fields.forEach(field => {
                cleanRow[field.name] = row[field.name]
            })
            return cleanRow
        })
        
        try {
            await onUpload(cleanData)
            // Close the modal after successful upload
            if (onOpenChange) {
                onOpenChange(false)
            }
        } catch (error) {
            // Error handling is done in the parent component
            console.error('Upload failed:', error)
        }
    }

    const getValidRowsCount = () => parsedRows.filter(row => row._isValid).length
    const getInvalidRowsCount = () => parsedRows.filter(row => !row._isValid).length

    const renderFieldInput = (field: FieldSchema, value: any, onChange: (value: any) => void) => {
        switch (field.type) {
            case 'custom':
                return field.customRenderer ? field.customRenderer(value, onChange) : (
                    <Input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.name}
                    />
                )
            case 'select':
                return (
                    <Select value={value} onValueChange={onChange}>
                        <SelectTrigger>
                            <SelectValue placeholder={`Select ${field.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options?.map(option => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )
            case 'boolean':
                return (
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={value}
                            onCheckedChange={onChange}
                            id={field.name}
                        />
                        <Label htmlFor={field.name}>{field.name}</Label>
                    </div>
                )
            case 'number':
                return (
                    <Input
                        type="number"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.name}
                    />
                )
            default:
                return (
                    <Input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.name}
                    />
                )
        }
    }

    const renderUploadStep = () => {
        const derivedRequired = schema.fields.filter(f => f.required).map(f => f.name)
        const derivedOptional = schema.fields.filter(f => !f.required).map(f => f.name)
        const requiredList = schema.instructions?.required ?? derivedRequired
        const optionalList = schema.instructions?.optional ?? derivedOptional

        const handleDownloadBlankTemplate = () => {
            const headers = schema.fields.map(f => f.name)
            const blankRow: Record<string, any> = {}
            headers.forEach(h => { blankRow[h] = "" })
            const safeTitle = (schema.title || title || 'template').toString().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            downloadCSV([blankRow], `${safeTitle}-blank.csv`)
        }

        return (
        <div className="space-y-4">
            <div>
                <Label className="block text-sm font-medium mb-2">Select CSV File</Label>
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-zinc-700 dark:text-zinc-200 file:bg-blue-600 file:text-white file:rounded-md file:px-4 file:py-2 file:cursor-pointer file:hover:bg-blue-700"
                />
            </div>
            
            {schema.description && (
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    <p className="mb-2">{schema.description}</p>
                </div>
            )}
            
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {requiredList.length > 0 && (
                    <>
                        <p className="font-medium mb-2">Required columns:</p>
                        <ul className="list-disc list-inside space-y-1">
                            {requiredList.map(field => (
                                <li key={field}><strong>{field}</strong></li>
                            ))}
                        </ul>
                    </>
                )}
                {optionalList.length > 0 && (
                    <>
                        <p className="font-medium mt-3 mb-2">Optional columns:</p>
                        <ul className="list-disc list-inside space-y-1">
                            {optionalList.map(field => (
                                <li key={field}><strong>{field}</strong></li>
                            ))}
                        </ul>
                    </>
                )}
            </div>

            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadBlankTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download blank template
                </Button>
            </div>
        </div>
        )
    }

    const renderPreviewStep = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Preview & Validation</h3>
                <div className="flex gap-2">
                    <Badge variant={getValidRowsCount() > 0 ? "default" : "destructive"}>
                        {getValidRowsCount()} Valid
                    </Badge>
                    {getInvalidRowsCount() > 0 && (
                        <Badge variant="destructive">
                            {getInvalidRowsCount()} Invalid
                        </Badge>
                    )}
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {parsedRows.map((row, index) => (
                                    <div key={index} className={cn(
                    "border rounded-lg p-3 mb-2",
                    row._isValid 
                        ? "border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-950/20" 
                        : "border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-950/20"
                )}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                {row._isValid ? (
                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                )}
                                <span className="font-medium">Row {index + 1}</span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditRow(index)}
                                >
                                    <Edit3 className="h-3 w-3 mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteRow(index)}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {schema.fields.map(field => (
                                <div key={field.name}>
                                    <strong>{field.name}:</strong> {row[field.name]?.toString() || '-'}
                                </div>
                            ))}
                        </div>

                        {row._errors.length > 0 && (
                            <div className="mt-2">
                                {row._errors.map((error, errorIndex) => (
                                    <div key={errorIndex} className="text-red-600 dark:text-red-400 text-xs">
                                        • {error.field}: {error.message}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )

    const renderEditStep = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Edit Row {editingIndex! + 1}</h3>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteRow(editingIndex!)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete Row
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        Cancel
                    </Button>
                </div>
            </div>

            {editingRow && (
                <div className="space-y-3">
                    {schema.fields.map(field => (
                        <div key={field.name}>
                            <Label className="block text-sm font-medium mb-1">
                                {field.name} {field.required && '*'}
                            </Label>
                            {renderFieldInput(
                                field,
                                editingRow[field.name],
                                (value) => setEditingRow({ ...editingRow, [field.name]: value })
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                    Save Changes
                </Button>
            </div>
        </div>
    )

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                <Dialog.Content
                    className={cn(
                        "fixed z-50 left-1/2 top-1/2 w-[95vw] max-w-4xl -translate-x-1/2 -translate-y-1/2",
                        "rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900",
                        "p-6 shadow-lg focus:outline-none max-h-[90vh] overflow-y-auto"
                    )}
                >
                    <div className="flex items-center justify-between mb-4">
                        <Dialog.Title className="text-lg font-semibold dark:text-white">
                            {schema.title || title}
                        </Dialog.Title>
                        {currentStep !== 'upload' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentStep('upload')}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Back
                            </Button>
                        )}
                    </div>

                    {error && (
                        <Alert className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {currentStep === 'upload' && renderUploadStep()}
                    {currentStep === 'preview' && renderPreviewStep()}
                    {currentStep === 'edit' && renderEditStep()}

                    {currentStep === 'preview' && (
                    <div className="mt-6 flex justify-end gap-2">
                        <Dialog.Close asChild>
                                <Button variant="outline">
                                Cancel
                                </Button>
                        </Dialog.Close>
                            <Button
                            onClick={handleUpload}
                                disabled={getValidRowsCount() === 0}
                            className={cn(
                                    getValidRowsCount() === 0 && "opacity-50 cursor-not-allowed"
                            )}
                        >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload {getValidRowsCount()} Rows
                            </Button>
                    </div>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
