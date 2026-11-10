import type { Tool } from './annotation.types';
import {
  Brand,
  SaveButton,
  Spacer,
  ToolButton,
  Toolbar,
} from './annotation.styles';

interface AnnotationToolbarProps {
  title: string;
  tool: Tool;
  saving: boolean;
  canSave: boolean;
  selectTool(): void;
  drawTool(): void;
  addRectangle(): void;
  addText(): void;
  removeSelected(): void;
  save(): void;
}

export function AnnotationToolbar({
  title,
  tool,
  saving,
  canSave,
  selectTool,
  drawTool,
  addRectangle,
  addText,
  removeSelected,
  save,
}: AnnotationToolbarProps) {
  return (
    <Toolbar>
      <Brand>
        <strong>Annotate capture</strong>
        <span>{title}</span>
      </Brand>
      <ToolButton $active={tool === 'select'} onClick={selectTool}>
        Select
      </ToolButton>
      <ToolButton $active={tool === 'pen'} onClick={drawTool}>
        Draw
      </ToolButton>
      <ToolButton onClick={addRectangle}>Rectangle</ToolButton>
      <ToolButton onClick={addText}>Text</ToolButton>
      <ToolButton onClick={removeSelected}>Delete</ToolButton>
      <Spacer />
      <SaveButton disabled={saving || !canSave} onClick={save}>
        {saving ? 'Saving…' : 'Save annotation'}
      </SaveButton>
    </Toolbar>
  );
}
