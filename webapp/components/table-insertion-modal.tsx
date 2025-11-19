"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface TableInsertionModalProps {
  isOpen: boolean
  onClose: () => void
  onInsertTable: (rows: number, cols: number, withHeaderRow: boolean) => void
}

export function TableInsertionModal({ isOpen, onClose, onInsertTable }: TableInsertionModalProps) {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [withHeaderRow, setWithHeaderRow] = useState(true)

  const handleSubmit = () => {
    if (rows > 0 && cols > 0 && rows <= 20 && cols <= 10) {
      onInsertTable(rows, cols, withHeaderRow)
      handleClose()
    }
  }

  const handleClose = () => {
    setRows(3)
    setCols(3)
    setWithHeaderRow(true)
    onClose()
  }

  const handleRowsChange = (value: string) => {
    const num = Number.parseInt(value)
    if (!isNaN(num) && num >= 1 && num <= 20) {
      setRows(num)
    }
  }

  const handleColsChange = (value: string) => {
    const num = Number.parseInt(value)
    if (!isNaN(num) && num >= 1 && num <= 10) {
      setCols(num)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Insert Table</DialogTitle>
          <DialogDescription>
            Specify the dimensions for your new table. Maximum 20 rows and 10 columns.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="rows">Rows</Label>
              <Input
                id="rows"
                type="number"
                min="1"
                max="20"
                value={rows}
                onChange={(e) => handleRowsChange(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cols">Columns</Label>
              <Input
                id="cols"
                type="number"
                min="1"
                max="10"
                value={cols}
                onChange={(e) => handleColsChange(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="header-row"
              checked={withHeaderRow}
              onCheckedChange={(checked) => setWithHeaderRow(checked as boolean)}
            />
            <Label
              htmlFor="header-row"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Include header row
            </Label>
          </div>

          <div className="text-sm text-muted-foreground">
            Preview: {rows} rows × {cols} columns {withHeaderRow ? "(with header)" : ""}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={rows < 1 || cols < 1 || rows > 20 || cols > 10}>
            Insert Table
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
